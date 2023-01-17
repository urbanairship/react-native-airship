/* Copyright Airship and Contributors */

#import "UARCTMessageView.h"

#ifdef RN_FABRIC_ENABLED
#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>
#import <react/renderer/components/urbanairshiprn/ComponentDescriptors.h>
#import <react/renderer/components/urbanairshiprn/Props.h>

using namespace facebook::react;
#endif

@interface UARCTMessageView()
@property (nonatomic, strong) UANativeBridge *nativeBridge;
@property (nonatomic, strong) UAMessageCenterNativeBridgeExtension *nativeBridgeExtension;
@property (nonatomic, strong) WKWebView *webView;
@property (nonatomic, strong) UAInboxMessage *message;
@property (nonatomic, strong) UADisposable *fetchMessagesDisposable;
@end

NSString *const UARCTMessageViewErrorMessageNotAvailable = @"MESSAGE_NOT_AVAILABLE";
NSString *const UARCTMessageViewErrorFailedToFetchMessage = @"FAILED_TO_FETCH_MESSAGE";
NSString *const UARCTMessageViewErrorMessageLoadFailed = @"MESSAGE_LOAD_FAILED";

NSString *const UARCTMessageViewMessageIDKey = @"messageId";
NSString *const UARCTMessageViewRetryableKey = @"retryable";
NSString *const UARCTMessageViewErrorKey = @"error";

@implementation UARCTMessageView

#ifdef RN_FABRIC_ENABLED
- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {
        static const auto defaultProps = std::make_shared<const UARCTMessageViewProps>();
        _props = defaultProps;
    }
    return self;
}
#endif

- (instancetype) init {
    self = [self initWithFrame:CGRectZero];
    if (self) {
        self.nativeBridge = [[UANativeBridge alloc] init];
        self.nativeBridge.forwardNavigationDelegate = self;
        self.nativeBridge.nativeBridgeDelegate = self;
        self.nativeBridgeExtension = [[UAMessageCenterNativeBridgeExtension alloc] init];
        self.nativeBridge.nativeBridgeExtensionDelegate = self.nativeBridgeExtension;

        self.webView = [[WKWebView alloc] initWithFrame:self.bounds];
        self.webView.navigationDelegate = self.nativeBridge;
        self.webView.allowsLinkPreview = ![UAMessageCenter shared].defaultUI.disableMessageLinkPreviewAndCallouts;
        self.webView.configuration.dataDetectorTypes = WKDataDetectorTypeAll;

        [self addSubview:self.webView];
    }
    return self;
}

#ifdef RN_FABRIC_ENABLED
+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<UARCTMessageViewComponentDescriptor>();
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    const auto &newProps = *std::static_pointer_cast<const UARCTMessageViewProps>(props);
    self.messageID = [NSString stringWithUTF8String:newProps.messageId.c_str()];
    
    [super updateProps:props oldProps:oldProps];
}
#endif

- (void)layoutSubviews {
    [super layoutSubviews];
    self.webView.frame = self.bounds;
}

- (void)setMessageID:(NSString *)messageID {
    _messageID = messageID;

    UA_WEAKIFY(self);
    dispatch_async(dispatch_get_main_queue(), ^{
        UA_STRONGIFY(self)
        [self loadMessage];
    });
}

- (void)loadMessage {
    NSString *messageID = self.messageID;
    [self dispatchOnLoadStartedEvent:messageID];

    if (!UAirship.isFlying) {
        [self dispatchOnLoadErrorEvent:messageID withErrorMessage:UARCTMessageViewErrorMessageNotAvailable retryable:NO];
        return;
    }

    UAInboxMessage *message = [[UAMessageCenter shared].messageList messageForID:messageID];
    if (message) {
        [self requestMessageBody:message];
        return;
    }

    UA_WEAKIFY(self);

    self.fetchMessagesDisposable = [[UAMessageCenter shared].messageList retrieveMessageListWithSuccessBlock:^{
        dispatch_async(dispatch_get_main_queue(), ^{
            UA_STRONGIFY(self)

            UAInboxMessage *message = [[UAMessageCenter shared].messageList messageForID:messageID];
            if (message && !message.isExpired) {
                [self requestMessageBody:message];
            } else {
                [self dispatchOnLoadErrorEvent:messageID withErrorMessage:UARCTMessageViewErrorMessageNotAvailable retryable:NO];
            }
        });
    } withFailureBlock:^{
        [self dispatchOnLoadErrorEvent:messageID withErrorMessage:UARCTMessageViewErrorFailedToFetchMessage retryable:YES];
    }];

}

- (void)requestMessageBody:(UAInboxMessage *)message {
    self.message = message;
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:self.message.messageBodyURL];
    request.timeoutInterval = 60;

    UA_WEAKIFY(self)
    [[UAMessageCenter shared].user getUserData:^(UAUserData *userData) {
        UA_STRONGIFY(self)
        NSString *auth = [UAUtils authHeaderStringWithName:userData.username password:userData.password];
        [request setValue:auth forHTTPHeaderField:@"Authorization"];
        [self.webView loadRequest:request];
    } queue:dispatch_get_main_queue()];
}

- (void)webView:(WKWebView *)wv decidePolicyForNavigationResponse:(WKNavigationResponse *)navigationResponse decisionHandler:(void (^)(WKNavigationResponsePolicy))decisionHandler {
    if ([navigationResponse.response isKindOfClass:[NSHTTPURLResponse class]]) {
        NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *)navigationResponse.response;
        NSInteger status = httpResponse.statusCode;
        if (status >= 400 && status <= 599) {
            decisionHandler(WKNavigationResponsePolicyCancel);
            if (status >= 500) {
                [self dispatchOnLoadErrorEvent:self.message.messageID withErrorMessage:UARCTMessageViewErrorMessageLoadFailed retryable:YES];
            } else if (status == 410) {
                [self dispatchOnLoadErrorEvent:self.message.messageID withErrorMessage:UARCTMessageViewErrorMessageNotAvailable retryable:NO];
            } else {
                [self dispatchOnLoadErrorEvent:self.message.messageID withErrorMessage:UARCTMessageViewErrorMessageLoadFailed retryable:NO];
            }
            return;
        }
    }

    decisionHandler(WKNavigationResponsePolicyAllow);

}

- (void)webView:(WKWebView *)wv didFinishNavigation:(WKNavigation *)navigation {
    if ([UAMessageCenter shared].defaultUI.disableMessageLinkPreviewAndCallouts) {
        [self.webView evaluateJavaScript:@"document.body.style.webkitTouchCallout='none';" completionHandler:nil];
    }

    if (self.message.unread) {
        [self.message markMessageReadWithCompletionHandler:nil];
    }

    [self dispatchOnLoadFinishedEvent:self.message.messageID];
}

- (void)webView:(WKWebView *)wv didFailNavigation:(WKNavigation *)navigation withError:(NSError *)error {
    if (error.code == NSURLErrorCancelled) {
        return;
    }

    [self dispatchOnLoadErrorEvent:self.message.messageID withErrorMessage:UARCTMessageViewErrorMessageLoadFailed retryable:YES];
}

- (void)webView:(WKWebView *)webView didFailProvisionalNavigation:(WKNavigation *)navigation withError:(NSError *)error {
    [self webView:webView didFailNavigation:navigation withError:error];
}

- (void)close {
    [self dispatchOnCloseEvent:self.message.messageID];
    self.message = nil;
}

- (void)dispatchOnLoadStartedEvent: (NSString*)messageID
{
#ifdef RN_FABRIC_ENABLED
    std::dynamic_pointer_cast<const facebook::react::UARCTMessageViewEventEmitter>(_eventEmitter)
        ->onLoadStarted(facebook::react::UARCTMessageViewEventEmitter::OnLoadStarted{
            .messageId = std::string([messageID UTF8String])
        });
#else
    if (self.onLoadStarted) {
        self.onLoadStarted(@{ UARCTMessageViewMessageIDKey: messageID });
    }
#endif
}

- (void)dispatchOnLoadErrorEvent: (NSString*)messageID
                withErrorMessage: (NSString*)errorMessage
                       retryable: (BOOL)retryable
{
#ifdef RN_FABRIC_ENABLED
    std::dynamic_pointer_cast<const facebook::react::UARCTMessageViewEventEmitter>(_eventEmitter)
        ->onLoadError(facebook::react::UARCTMessageViewEventEmitter::OnLoadError{
            .messageId = std::string([messageID UTF8String]),
            .error = std::string([errorMessage UTF8String]),
            .retryable = retryable
        });
#else
    if (self.onLoadError) {
        self.onLoadError(@{ UARCTMessageViewMessageIDKey: messageID,
                            UARCTMessageViewErrorKey: errorMessage,
                            UARCTMessageViewRetryableKey: @(retryable) });
    }
#endif
}

- (void)dispatchOnLoadFinishedEvent: (NSString*)messageID
{
#ifdef RN_FABRIC_ENABLED
    std::dynamic_pointer_cast<const facebook::react::UARCTMessageViewEventEmitter>(_eventEmitter)
        ->onLoadFinished(facebook::react::UARCTMessageViewEventEmitter::OnLoadFinished{
            .messageId = std::string([messageID UTF8String])
        });
#else
    if (self.onLoadFinished) {
        self.onLoadFinished(@{ UARCTMessageViewMessageIDKey: messageID });
    }
#endif
}

- (void)dispatchOnCloseEvent: (NSString*)messageID
{
#ifdef RN_FABRIC_ENABLED
    std::dynamic_pointer_cast<const facebook::react::UARCTMessageViewEventEmitter>(_eventEmitter)
        ->onClose(facebook::react::UARCTMessageViewEventEmitter::OnClose{
            .messageId = std::string([messageID UTF8String])
        });
#else
    if (self.onClose) {
        self.onClose(@{ UARCTMessageViewMessageIDKey: messageID });
    }
#endif
}

@end

#ifdef RN_FABRIC_ENABLED
Class<RCTComponentViewProtocol> UARCTMessageViewCls(void)
{
    return UARCTMessageView.class;
}
#endif

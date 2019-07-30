/* Copyright Airship and Contributors */

#import "UARCTMessageView.h"

@interface UARCTMessageView()
@property (nonatomic, strong) UAWKWebViewNativeBridge *nativeBridge;
@property (nonatomic, strong) WKWebView *webView;
@property (nonatomic, strong) UAInboxMessage *message;
@property (nonatomic, strong) UADisposable *fetchMessagesDisposable;
@end

NSString *const UARCTMessageViewErrorMessageNotAvailable = @"MESSAGE_NOT_AVAILABLE";
NSString *const UARCTMessageViewErrorFailedToFetchMessage = @"FAILED_TO_FETCH_MESSAGE";
NSString *const UARCTMessageViewErrorMessageLoadFailed = @"MESSAGE_LOAD_FAILED";

NSString *const UARCTMessageViewMessageKey = @"message";
NSString *const UARCTMessageViewRetryableKey = @"retryable";
NSString *const UARCTMessageViewErrorKey = @"error";

@implementation UARCTMessageView

- (instancetype) init {
    self = [super initWithFrame:CGRectZero];
    if (self) {
        self.nativeBridge = [[UAWKWebViewNativeBridge alloc] init];
        self.nativeBridge.forwardDelegate = self;
        self.webView = [[WKWebView alloc] initWithFrame:self.bounds];
        self.webView.navigationDelegate = self.nativeBridge;
        self.webView.allowsLinkPreview = ![UAirship messageCenter].disableMessageLinkPreviewAndCallouts;
        self.webView.configuration.dataDetectorTypes = WKDataDetectorTypeAll;
        [self addSubview:self.webView];
    }
    return self;
}

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
    if (self.onLoadStarted) {
        self.onLoadStarted(@{ UARCTMessageViewMessageKey: messageID });
    }

    UAInboxMessage *message = [[UAirship inbox].messageList messageForID:messageID];
    if (message) {
        [self requestMessageBody:message];
        return;
    }

    UA_WEAKIFY(self);

    self.fetchMessagesDisposable = [[UAirship inbox].messageList retrieveMessageListWithSuccessBlock:^{
        dispatch_async(dispatch_get_main_queue(), ^{
            UA_STRONGIFY(self)

            UAInboxMessage *message = [[UAirship inbox].messageList messageForID:messageID];
            if (message && !message.isExpired) {
                [self requestMessageBody:message];
            } else {
                if (self.onLoadError) {
                    self.onLoadError(@{ UARCTMessageViewMessageKey: messageID,
                                        UARCTMessageViewErrorKey: UARCTMessageViewErrorMessageNotAvailable,
                                        UARCTMessageViewRetryableKey: @(NO) });
                }
            }
        });
    } withFailureBlock:^{
        if (self.onLoadError) {
            self.onLoadError(@{ UARCTMessageViewMessageKey: messageID,
                                UARCTMessageViewErrorKey: UARCTMessageViewErrorFailedToFetchMessage,
                                UARCTMessageViewRetryableKey: @(YES) });
        }
    }];

}

- (void)requestMessageBody:(UAInboxMessage *)message {
    self.message = message;
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:self.message.messageBodyURL];
    request.timeoutInterval = 60;

    UA_WEAKIFY(self)
    [[UAirship inboxUser] getUserData:^(UAUserData *userData) {
        UA_STRONGIFY(self)
        NSString *auth = [UAUtils userAuthHeaderString:userData];
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
                if (self.onLoadError) {
                    self.onLoadError(@{ UARCTMessageViewMessageKey: self.message.messageID,
                                        UARCTMessageViewErrorKey: UARCTMessageViewErrorMessageLoadFailed,
                                        UARCTMessageViewRetryableKey: @(YES) });
                }
            } else if (status == 410) {
                if (self.onLoadError) {
                    self.onLoadError(@{ UARCTMessageViewMessageKey: self.message.messageID,
                                        UARCTMessageViewErrorKey: UARCTMessageViewErrorMessageNotAvailable,
                                        UARCTMessageViewRetryableKey: @(NO) });
                }
            } else {
                if (self.onLoadError) {
                    self.onLoadError(@{ UARCTMessageViewMessageKey: self.message.messageID,
                                        UARCTMessageViewErrorKey: UARCTMessageViewErrorMessageLoadFailed,
                                        UARCTMessageViewRetryableKey: @(NO) });
                }
            }
            return;
        }
    }

    decisionHandler(WKNavigationResponsePolicyAllow);

}

- (void)webView:(WKWebView *)wv didFinishNavigation:(WKNavigation *)navigation {
    if ([UAirship messageCenter].disableMessageLinkPreviewAndCallouts) {
        [self.webView evaluateJavaScript:@"document.body.style.webkitTouchCallout='none';" completionHandler:nil];
    }

    if (self.message.unread) {
        [self.message markMessageReadWithCompletionHandler:nil];
    }

    if (self.onLoadFinished) {
        self.onLoadFinished(@{ UARCTMessageViewMessageKey: self.message.messageID });
    }
}

- (void)webView:(WKWebView *)wv didFailNavigation:(WKNavigation *)navigation withError:(NSError *)error {
    if (error.code == NSURLErrorCancelled) {
        return;
    }

    if (self.onLoadError) {
        self.onLoadError(@{ UARCTMessageViewMessageKey: self.message.messageID,
                            UARCTMessageViewErrorKey: UARCTMessageViewErrorMessageLoadFailed,
                            UARCTMessageViewRetryableKey: @(YES) });
    }
}

- (void)webView:(WKWebView *)webView didFailProvisionalNavigation:(WKNavigation *)navigation withError:(NSError *)error {
    [self webView:webView didFailNavigation:navigation withError:error];
}

- (void)closeWindowAnimated:(BOOL)animated {
    if (self.onClose) {
        self.onClose(@{ UARCTMessageViewMessageKey: self.message.messageID });
    }
}


@end


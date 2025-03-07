/* Copyright Airship and Contributors */

#import "RTNAirshipMessageView.h"

#if __has_include(<react_native_airship/react_native_airship-Swift.h>)
#import <react_native_airship/react_native_airship-Swift.h>
#else
#import "react_native_airship-Swift.h"
#endif

#ifdef RCT_NEW_ARCH_ENABLED
#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>
#import <react/renderer/components/RTNAirshipSpec/ComponentDescriptors.h>
#import <react/renderer/components/RTNAirshipSpec/Props.h>
using namespace facebook::react;
#endif

@interface RTNAirshipMessageView()<RTNAirshipMessageWebViewWrapperDelegate>
@property (nonatomic, strong) RTNAirshipMessageWebViewWrapper *wrapper;
@end

NSString *const RTNAirshipMessageViewErrorMessageNotAvailable = @"MESSAGE_NOT_AVAILABLE";
NSString *const RTNAirshipMessageViewErrorFailedToFetchMessage = @"FAILED_TO_FETCH_MESSAGE";
NSString *const RTNAirshipMessageViewErrorMessageLoadFailed = @"MESSAGE_LOAD_FAILED";

NSString *const RTNAirshipMessageViewMessageIDKey = @"messageId";
NSString *const RTNAirshipMessageViewRetryableKey = @"retryable";
NSString *const RTNAirshipMessageViewErrorKey = @"error";

@implementation RTNAirshipMessageView

#ifdef RCT_NEW_ARCH_ENABLED

// Needed because of this: https://github.com/facebook/react-native/pull/37274
+ (void)load
{
  [super load];
}

- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {
        static const auto defaultProps = std::make_shared<const RTNAirshipMessageViewProps>();
        _props = defaultProps;
    }
    return self;
}
#endif

- (instancetype) init {
    self = [self initWithFrame:CGRectZero];
    if (self) {
        self.wrapper = [[RTNAirshipMessageWebViewWrapper alloc] initWithFrame:self.bounds];
        self.wrapper.delegate = self;
        [self addSubview:self.wrapper.webView];
    }
    return self;
}

#ifdef RCT_NEW_ARCH_ENABLED
+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RTNAirshipMessageViewComponentDescriptor>();
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    const auto &newProps = *std::static_pointer_cast<const RTNAirshipMessageViewProps>(props);
    self.messageID = [NSString stringWithUTF8String:newProps.messageId.c_str()];
    
    [super updateProps:props oldProps:oldProps];
}
#endif

- (void)layoutSubviews {
    [super layoutSubviews];
    self.wrapper.webView.frame = self.bounds;
}

- (void)setMessageID:(NSString *)messageID {
    _messageID = messageID;
    __weak RTNAirshipMessageView *weakSelf = self;
    dispatch_async(dispatch_get_main_queue(), ^{
        [weakSelf.wrapper loadMessageWithMessageID:messageID];
    });
}

- (void)onCloseWithMessageID:(NSString *)messageID {
    [self dispatchOnCloseEvent:messageID];
}

- (void)onLoadStartedWithMessageID:(NSString *)messageID {
    [self dispatchOnLoadStartedEvent:messageID];
}

- (void)onLoadFinishedWithMessageID:(NSString *)messageID {
    [self dispatchOnLoadFinishedEvent:messageID];
}

- (void)onMessageGoneWithMessageID:(NSString *)messageID {
    [self dispatchOnLoadErrorEvent:messageID
                  withErrorMessage:RTNAirshipMessageViewErrorMessageNotAvailable
                         retryable:NO];
}

- (void)onMessageLoadFailedWithMessageID:(NSString *)messageID {
    [self dispatchOnLoadErrorEvent:messageID
                  withErrorMessage:RTNAirshipMessageViewErrorFailedToFetchMessage
                         retryable:YES];
}

- (void)onMessageBodyLoadFailedWithMessageID:(NSString *)messageID {
    [self dispatchOnLoadErrorEvent:messageID
                  withErrorMessage:RTNAirshipMessageViewErrorMessageLoadFailed
                         retryable:YES];
}

- (void)dispatchOnLoadStartedEvent: (NSString*)messageID
{
#ifdef RCT_NEW_ARCH_ENABLED
    std::dynamic_pointer_cast<const facebook::react::RTNAirshipMessageViewEventEmitter>(_eventEmitter)
        ->onLoadStarted(facebook::react::RTNAirshipMessageViewEventEmitter::OnLoadStarted{
            .messageId = std::string([messageID UTF8String])
        });
#else
    if (self.onLoadStarted) {
        self.onLoadStarted(@{
            RTNAirshipMessageViewMessageIDKey: messageID
        });
    }
#endif
}

- (void)dispatchOnLoadErrorEvent: (NSString*)messageID
                withErrorMessage: (NSString*)errorMessage
                       retryable: (BOOL)retryable
{
#ifdef RCT_NEW_ARCH_ENABLED
    std::dynamic_pointer_cast<const facebook::react::RTNAirshipMessageViewEventEmitter>(_eventEmitter)
        ->onLoadError(facebook::react::RTNAirshipMessageViewEventEmitter::OnLoadError{
            .messageId = std::string([messageID UTF8String]),
            .error = std::string([errorMessage UTF8String]),
            .retryable = retryable
        });
#else
    if (self.onLoadError) {
        self.onLoadError(@{ RTNAirshipMessageViewMessageIDKey: messageID,
                            RTNAirshipMessageViewErrorKey: errorMessage,
                            RTNAirshipMessageViewRetryableKey: @(retryable) });
    }
#endif
}

- (void)dispatchOnLoadFinishedEvent: (NSString*)messageID
{
#ifdef RCT_NEW_ARCH_ENABLED
    std::dynamic_pointer_cast<const facebook::react::RTNAirshipMessageViewEventEmitter>(_eventEmitter)
        ->onLoadFinished(facebook::react::RTNAirshipMessageViewEventEmitter::OnLoadFinished{
            .messageId = std::string([messageID UTF8String])
        });
#else
    if (self.onLoadFinished) {
        self.onLoadFinished(@{ RTNAirshipMessageViewMessageIDKey: messageID });
    }
#endif
}

- (void)dispatchOnCloseEvent: (NSString*)messageID
{
#ifdef RCT_NEW_ARCH_ENABLED
    std::dynamic_pointer_cast<const facebook::react::RTNAirshipMessageViewEventEmitter>(_eventEmitter)
        ->onClose(facebook::react::RTNAirshipMessageViewEventEmitter::OnClose{
            .messageId = std::string([messageID UTF8String])
        });
#else
    if (self.onClose) {
        self.onClose(@{ RTNAirshipMessageViewMessageIDKey: messageID });
    }
#endif
}

@end

#ifdef RCT_NEW_ARCH_ENABLED
Class<RCTComponentViewProtocol> RTNAirshipMessageViewCls(void)
{
    return RTNAirshipMessageView.class;
}
#endif

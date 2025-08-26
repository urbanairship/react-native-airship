/* Copyright Airship and Contributors */

#import "RNAirshipMessageView.h"

#if __has_include(<react_native_airship/react_native_airship-Swift.h>)
#import <react_native_airship/react_native_airship-Swift.h>
#else
#import "react_native_airship-Swift.h"
#endif

#import "generated/RNAirshipSpec/ComponentDescriptors.h"
#import "generated/RNAirshipSpec/EventEmitters.h"
#import "generated/RNAirshipSpec/Props.h"
#import "generated/RNAirshipSpec/RCTComponentViewHelpers.h"

#ifdef RCT_NEW_ARCH_ENABLED
#import "RCTFabricComponentsPlugins.h"
using namespace facebook::react;
#endif

@interface RNAirshipMessageView() <RNAirshipMessageWebViewWrapperDelegate, RCTRNAirshipMessageViewViewProtocol>
@property (nonatomic, strong)RNAirshipMessageWebViewWrapper *wrapper;
@end

NSString *const RNAirshipMessageViewErrorMessageNotAvailable = @"MESSAGE_NOT_AVAILABLE";
NSString *const RNAirshipMessageViewErrorFailedToFetchMessage = @"FAILED_TO_FETCH_MESSAGE";
NSString *const RNAirshipMessageViewErrorMessageLoadFailed = @"MESSAGE_LOAD_FAILED";

NSString *const RNAirshipMessageViewMessageIDKey = @"messageId";
NSString *const RNAirshipMessageViewRetryableKey = @"retryable";
NSString *const RNAirshipMessageViewErrorKey = @"error";

@implementation RNAirshipMessageView

#ifdef RCT_NEW_ARCH_ENABLED

// Needed because of this: https://github.com/facebook/react-native/pull/37274
+ (void)load
{
  [super load];
}

- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {
        static const auto defaultProps = std::make_shared<const RNAirshipMessageViewProps>();
        _props = defaultProps;
    }
    return self;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RNAirshipMessageViewComponentDescriptor>();
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    const auto &newProps = *std::static_pointer_cast<const RNAirshipMessageViewProps>(props);
    self.messageID = [NSString stringWithUTF8String:newProps.messageId.c_str()];

    [super updateProps:props oldProps:oldProps];
}
#endif

- (instancetype) init {
    self = [self initWithFrame:CGRectZero];
    if (self) {
        self.wrapper = [[RNAirshipMessageWebViewWrapper alloc] initWithFrame:self.bounds];
        self.wrapper.delegate = self;
        [self addSubview:self.wrapper.webView];
    }
    return self;
}


- (void)layoutSubviews {
    [super layoutSubviews];
    self.wrapper.webView.frame = self.bounds;
}

- (void)setMessageID:(NSString *)messageID {
    _messageID = messageID;
    __weak RNAirshipMessageView *weakSelf = self;
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
                  withErrorMessage:RNAirshipMessageViewErrorMessageNotAvailable
                         retryable:NO];
}

- (void)onMessageLoadFailedWithMessageID:(NSString *)messageID {
    [self dispatchOnLoadErrorEvent:messageID
                  withErrorMessage:RNAirshipMessageViewErrorFailedToFetchMessage
                         retryable:YES];
}

- (void)onMessageBodyLoadFailedWithMessageID:(NSString *)messageID {
    [self dispatchOnLoadErrorEvent:messageID
                  withErrorMessage:RNAirshipMessageViewErrorMessageLoadFailed
                         retryable:YES];
}

- (void)dispatchOnLoadStartedEvent: (NSString*)messageID
{
#ifdef RCT_NEW_ARCH_ENABLED
    std::dynamic_pointer_cast<const facebook::react::RNAirshipMessageViewEventEmitter>(_eventEmitter)
        ->onLoadStarted(facebook::react::RNAirshipMessageViewEventEmitter::OnLoadStarted{
            .messageId = std::string([messageID UTF8String])
        });
#else
    if (self.onLoadStarted) {
        self.onLoadStarted(@{
           RNAirshipMessageViewMessageIDKey: messageID
        });
    }
#endif
}


- (void)dispatchOnLoadErrorEvent: (NSString*)messageID
                withErrorMessage: (NSString*)errorMessage
                       retryable: (BOOL)retryable
{
#ifdef RCT_NEW_ARCH_ENABLED
    std::dynamic_pointer_cast<const facebook::react::RNAirshipMessageViewEventEmitter>(_eventEmitter)
        ->onLoadError(facebook::react::RNAirshipMessageViewEventEmitter::OnLoadError{
            .messageId = std::string([messageID UTF8String]),
            .error = std::string([errorMessage UTF8String]),
            .retryable = retryable
        });
#else
    if (self.onLoadError) {
        self.onLoadError(@{RNAirshipMessageViewMessageIDKey: messageID,
                           RNAirshipMessageViewErrorKey: errorMessage,
                           RNAirshipMessageViewRetryableKey: @(retryable) });
    }
#endif
}

- (void)dispatchOnLoadFinishedEvent: (NSString*)messageID
{
#ifdef RCT_NEW_ARCH_ENABLED
  auto emitter = std::dynamic_pointer_cast<const facebook::react::RNAirshipMessageViewEventEmitter>(_eventEmitter);
  if (emitter){
    emitter->onLoadFinished(facebook::react::RNAirshipMessageViewEventEmitter::OnLoadFinished{
      .messageId = std::string([messageID UTF8String])
    });
  }
#else
    if (self.onLoadFinished) {
        self.onLoadFinished(@{RNAirshipMessageViewMessageIDKey: messageID });
    }
#endif
}

- (void)dispatchOnCloseEvent: (NSString*)messageID
{
#ifdef RCT_NEW_ARCH_ENABLED
    std::dynamic_pointer_cast<const facebook::react::RNAirshipMessageViewEventEmitter>(_eventEmitter)
        ->onClose(facebook::react::RNAirshipMessageViewEventEmitter::OnClose{
            .messageId = std::string([messageID UTF8String])
        });
#else
    if (self.onClose) {
        self.onClose(@{RNAirshipMessageViewMessageIDKey: messageID });
    }
#endif
}
@end


#ifdef RCT_NEW_ARCH_ENABLED

Class<RCTComponentViewProtocol>RNAirshipMessageViewCls(void)
{
    return RNAirshipMessageView.class;
}
#endif

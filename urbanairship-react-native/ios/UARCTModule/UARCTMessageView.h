/* Copyright Airship and Contributors */

#import <WebKit/WebKit.h>
#import <React/RCTView.h>

#ifdef RN_FABRIC_ENABLED
#import <React/RCTViewComponentView.h>
#endif

#if __has_include("AirshipLib.h")
#import "UAMessageCenterNativeBridgeExtension.h"
#import "UAInboxMessage.h"
#import "UAInboxMessageList.h"
#import "UAMessageCenter.h"
#import "UADefaultMessageCenterUI.h"
#else
@import AirshipKit;
#endif

NS_ASSUME_NONNULL_BEGIN

#ifdef RN_FABRIC_ENABLED
@interface UARCTMessageView : RCTViewComponentView <UANavigationDelegate, UANativeBridgeDelegate>
#else
@interface UARCTMessageView : RCTView <UANavigationDelegate, UANativeBridgeDelegate>
#endif

@property (nonatomic, copy) RCTDirectEventBlock onLoadStarted;
@property (nonatomic, copy) RCTDirectEventBlock onLoadFinished;
@property (nonatomic, copy) RCTDirectEventBlock onLoadError;
@property (nonatomic, copy) RCTDirectEventBlock onClose;
@property (nonatomic, copy) NSString *messageID;

@end

NS_ASSUME_NONNULL_END

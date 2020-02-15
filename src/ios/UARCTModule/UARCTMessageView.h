/* Copyright Airship and Contributors */


#import <WebKit/WebKit.h>
#import <React/RCTView.h>

#if __has_include("AirshipLib.h")
#import "UAMessageCenterNativeBridgeExtension.h"
#import "UAInboxMessage.h"
#import "UAInboxMessageList.h"
#import "UAMessageCenter.h"
#import "UADefaultMessageCenterUI.h"
#else
@import Airship;
#endif

NS_ASSUME_NONNULL_BEGIN

@interface UARCTMessageView : RCTView <WKNavigationDelegate, UANativeBridgeDelegate>

@property (nonatomic, copy) RCTDirectEventBlock onLoadStarted;
@property (nonatomic, copy) RCTDirectEventBlock onLoadFinished;
@property (nonatomic, copy) RCTDirectEventBlock onLoadError;
@property (nonatomic, copy) RCTDirectEventBlock onClose;
@property (nonatomic, copy) NSString *messageID;

@end

NS_ASSUME_NONNULL_END

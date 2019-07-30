/* Copyright Airship and Contributors */


#import <WebKit/WebKit.h>
#import <React/RCTView.h>

#if __has_include("AirshipLib.h")
#import "AirshipLib.h"
#else
@import AirshipKit;
#endif

NS_ASSUME_NONNULL_BEGIN

@interface UARCTMessageView : RCTView <UAWKWebViewDelegate>

@property (nonatomic, copy) RCTDirectEventBlock onLoadStarted;
@property (nonatomic, copy) RCTDirectEventBlock onLoadFinished;
@property (nonatomic, copy) RCTDirectEventBlock onLoadError;
@property (nonatomic, copy) RCTDirectEventBlock onClose;
@property (nonatomic, copy) NSString *messageID;

@end

NS_ASSUME_NONNULL_END

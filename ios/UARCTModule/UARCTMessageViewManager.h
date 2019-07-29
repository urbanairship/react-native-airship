/* Copyright Airship and Contributors */

#import <React/RCTViewManager.h>

#if __has_include("AirshipLib.h")
#import "AirshipLib.h"
#else
@import AirshipKit;
#endif

NS_ASSUME_NONNULL_BEGIN

@interface UARCTMessageViewManager : RCTViewManager

@end

NS_ASSUME_NONNULL_END

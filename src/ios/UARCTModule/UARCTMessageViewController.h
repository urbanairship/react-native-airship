/* Copyright Urban Airship and Contributors */

#if __has_include("AirshipLib.h")
#import "UADefaultMessageCenterMessageViewController.h"
#import "UAMessageCenterMessageViewDelegate.h"
#else
@import Airship;
#endif

@interface UARCTMessageViewController : UADefaultMessageCenterMessageViewController<UAMessageCenterMessageViewDelegate>

@end

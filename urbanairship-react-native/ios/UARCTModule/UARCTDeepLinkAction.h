/* Copyright Urban Airship and Contributors */

#if __has_include("AirshipLib.h")
#import "AirshipLib.h"
#else
@import AirshipKit;
#endif

/**
 * Custom deep link action that forwards incoming deep links to a delegate.
 */
@interface UARCTDeepLinkAction : NSObject <UAAction>

@end

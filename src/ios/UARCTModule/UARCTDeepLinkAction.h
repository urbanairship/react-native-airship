/* Copyright Urban Airship and Contributors */

#if __has_include("AirshipLib.h")
#import "AirshipLib.h"
#else
@import Airship;
#endif

/**
 * Deep link delegate method.
 */
@protocol UARCTDeepLinkDelegate

/**
 * Called when a new deep link is received.
 * @param deepLink The deep link.
 */
- (void)deepLinkReceived:(NSString *)deepLink;

@end

/**
 * Custom deep link action that forwards incoming deep links to a delegate.
 */
@interface UARCTDeepLinkAction : UAAction

/**
 * Deep link delegate.
 */
@property (nonatomic, weak) id<UARCTDeepLinkDelegate> deepLinkDelegate;

@end

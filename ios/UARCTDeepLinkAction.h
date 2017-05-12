/* Copyright 2017 Urban Airship and Contributors */

#import "AirshipLib.h"

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

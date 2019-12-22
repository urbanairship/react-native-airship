/* Copyright Urban Airship and Contributors */

#import <Foundation/Foundation.h>

#if __has_include("AirshipLib.h")
#import "UAMessageCenter.h"
#import "UADefaultMessageCenterUI.h"
#else
@import Airship;
#endif

extern NSString *const UARCTAutoLaunchMessageCenterKey;

extern NSString *const UARCTStatusMessageNotFound;
extern NSString *const UARCTStatusInboxRefreshFailed;
extern NSString *const UARCTErrorDescriptionMessageNotFound;
extern NSString *const UARCTErrorDescriptionInboxRefreshFailed;

extern int const UARCTErrorCodeMessageNotFound;
extern int const UARCTErrorCodeInboxRefreshFailed;

@interface UARCTMessageCenter : NSObject <UAMessageCenterDisplayDelegate>

/**
 * Returns the shared instance.
 * @returns the shared event emitter instance.
 */
+ (UARCTMessageCenter *)shared;

@end


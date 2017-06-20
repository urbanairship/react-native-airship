/* Copyright 2017 Urban Airship and Contributors */

#import <Foundation/Foundation.h>
#import "AirshipLib.h"

extern NSString *const UARCTAutoLaunchMessageCenterKey;

extern NSString *const UARCTStatusMessageNotFound;
extern NSString *const UARCTStatusInboxRefreshFailed;
extern NSString *const UARCTErrorDescriptionMessageNotFound;
extern NSString *const UARCTErrorDescriptionInboxRefreshFailed;

extern int const UARCTErrorCodeMessageNotFound;
extern int const UARCTErrorCodeInboxRefreshFailed;

@interface UARCTMessageCenter : NSObject <UAInboxDelegate>

/**
 * Returns the shared instance.
 * @returns the shared event emitter instance.
 */
+ (UARCTMessageCenter *)shared;

@end


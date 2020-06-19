/* Copyright Airship and Contributors */

#import <React/RCTEventEmitter.h>

#if __has_include("AirshipLib.h")
#import "AirshipLib.h"
#else
@import Airship;
#endif

/**
 * React module for Airship Location
 */
@interface AirshipLocationReactModule : NSObject <RCTBridgeModule>

@end

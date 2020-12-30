/* Copyright Urban Airship and Contributors */

@import Foundation;
@import UIKit;

#if __has_include("AirshipLib.h")
#import "AirshipLib.h"
#else
@import Airship;
#endif

extern NSString *const UARCTPresentationOptionsStorageKey;
extern NSString *const UARCTAirshipRecommendedVersion;

/**
 * Handles takeOff for the Urban Airship SDK.
 */
@interface UARCTAutopilot : NSObject

/**
 * Disables autopilot and react integration. Must be called before application:didFinishLaunchingWithOptions:.
 */
+ (void)disable;

/**
 * Performs takeOff.
 */
+ (void)takeOff;

@end

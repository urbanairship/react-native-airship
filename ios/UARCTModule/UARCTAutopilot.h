/* Copyright Urban Airship and Contributors */

@import Foundation;
@import UIKit;

@import Airship;

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

@end

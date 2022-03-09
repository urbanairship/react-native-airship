/* Copyright Urban Airship and Contributors */

@import Foundation;
@import UIKit;

#if __has_include("AirshipLib.h")
#import "AirshipLib.h"
#else
@import AirshipKit;
#endif


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
 * @launchOptions the lunch options.
 * @returns True if takeOff was called
 */
+ (BOOL)takeOffWithLaunchOptions:(NSDictionary *)launchOptions;

@end

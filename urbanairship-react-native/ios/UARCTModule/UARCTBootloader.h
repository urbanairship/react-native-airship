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
@interface UARCTBootloader : NSObject

/**
 * Disables automatic takeOff.
 */
+ (void)disable;

@end

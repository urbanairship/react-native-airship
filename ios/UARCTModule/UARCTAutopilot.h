/* Copyright 2017 Urban Airship and Contributors */

@import Foundation;
@import UIKit;

#if __has_include("AirshipLib.h")
#import "AirshipLib.h"
#else
@import AirshipKit;
#endif


extern NSString *const UARCTPresentationOptionsStorageKey;
extern NSString *const UARCTAirshipKitRecommendedVersion;

/**
 * Handles takeOff for the Urban Airship SDK.
 */
@interface UARCTAutopilot : NSObject


@end

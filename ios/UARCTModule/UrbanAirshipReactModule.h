/* Copyright 2017 Urban Airship and Contributors */

#import <React/RCTEventEmitter.h>
#import "AirshipLib.h"

@interface UrbanAirshipReactModule : RCTEventEmitter <UAPushNotificationDelegate, UARegistrationDelegate>

@end

/* Copyright Airship and Contributors */

#import "RNAirshipBootloader.h"

#import "RNAirshipBridge.h"

@implementation RNAirshipBootloader


+ (void)disable {
    RNAirshipBridgeDisablePluginLoader();
}
@end


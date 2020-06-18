/* Copyright Airship and Contributors */

#import "AirshipLocationReactModule.h"

@implementation AirshipLocationReactModule

#pragma mark -
#pragma mark Module methods

RCT_EXPORT_METHOD(setLocationEnabled:(BOOL)enabled) {
    [UAirship shared].locationProvider.locationUpdatesEnabled = enabled;
}

RCT_REMAP_METHOD(isLocationEnabled,
                 isLocationEnabled_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    resolve(@([UAirship shared].locationProvider.isLocationUpdatesEnabled));
}

RCT_REMAP_METHOD(isBackgroundLocationAllowed,
                 isBackgroundLocationAllowed_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    resolve(@([UAirship shared].locationProvider.isBackgroundLocationUpdatesAllowed));
}

RCT_EXPORT_METHOD(setBackgroundLocationAllowed:(BOOL)enabled) {
    [UAirship shared].locationProvider.backgroundLocationUpdatesAllowed = enabled;
}

@end

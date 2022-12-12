/* Copyright Urban Airship and Contributors */

#import <React/RCTBridgeModule.h>
#import "UARCTStorage.h"

@interface RCT_EXTERN_MODULE(AirshipPreferenceCenterModule, NSObject)

RCT_EXTERN_METHOD(open:(NSString *)preferenceCenterId)

RCT_EXTERN_METHOD(setUseCustomPreferenceCenterUi:(BOOL *)useCustomUi forPreferenceId:(NSString *)preferenceId)

RCT_EXTERN_METHOD(getConfiguration:(NSString *)preferenceCenterId resolver:(RCTPromiseResolveBlock *)resolve rejecter:(RCTPromiseRejectBlock)reject)

@end

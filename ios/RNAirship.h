/* Copyright Airship and Contributors */

#import <Foundation/Foundation.h>
#import <React/RCTEventEmitter.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import "generated/RNAirshipSpec/RNAirshipSpec.h"

@interface RNAirship : RCTEventEmitter <NativeRNAirshipSpec>
#else
#import <React/RCTBridgeModule.h>

@interface RNAirship : RCTEventEmitter <RCTBridgeModule>
#endif

@property(nonatomic, strong) RCTBridge *reactBridge;


@end

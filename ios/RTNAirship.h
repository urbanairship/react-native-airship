/* Copyright Airship and Contributors */

#import <Foundation/Foundation.h>
#import <React/RCTEventEmitter.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import "RTNAirshipSpec.h"

@interface RTNAirship : RCTEventEmitter <NativeRTNAirshipSpec>
#else
#import <React/RCTBridgeModule.h>

@interface RTNAirship : RCTEventEmitter <RCTBridgeModule>
#endif

@property(nonatomic, strong) RCTBridge *reactBridge;


@end

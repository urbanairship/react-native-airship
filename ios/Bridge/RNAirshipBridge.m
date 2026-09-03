/* Copyright Airship and Contributors */

#import "RNAirshipBridge.h"

// Class members that are looked up at runtime rather than through the
// RNAirshipBridge conformance. Declared privately so the calls type-check.
@protocol RNAirshipBridgeProvider
@property (nonatomic, class, readonly) id<RNAirshipBridge> shared;
@end

@protocol RNAirshipPluginLoaderProvider
@property (nonatomic, class) BOOL disabled;
@end

Class<RNAirshipBridge> RNAirshipBridgeClass(void) {
    return NSClassFromString(@"AirshipReactNative");
}

id<RNAirshipBridge> RNAirshipBridgeShared(void) {
    Class<RNAirshipBridgeProvider> cls = NSClassFromString(@"AirshipReactNative");
    return [cls shared];
}

Class RNAirshipMessageWebViewBridgeClass(void) {
    return NSClassFromString(@"RNAirshipMessageWebViewWrapper");
}

Class RNAirshipEmbeddedViewBridgeClass(void) {
    return NSClassFromString(@"RNAirshipEmbeddedViewWrapper");
}

void RNAirshipBridgeDisablePluginLoader(void) {
    Class<RNAirshipPluginLoaderProvider> cls = NSClassFromString(@"AirshipPluginLoader");
    [cls setDisabled:YES];
}

/* Copyright Airship and Contributors */

#import "RNAirshipEmbeddedViewManager.h"
#import "RNAirshipEmbeddedView.h"

#import <React/RCTBridge.h>
#import <React/RCTUIManager.h>

@implementation RNAirshipEmbeddedViewManager
RCT_EXPORT_VIEW_PROPERTY(config, NSString)
RCT_EXPORT_MODULE(RNAirshipEmbeddedView)

- (UIView *)view {
    return [[RNAirshipEmbeddedView alloc] init];
}

@end

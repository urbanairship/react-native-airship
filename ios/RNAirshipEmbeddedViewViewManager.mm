/* Copyright Airship and Contributors */

#import "RNAirshipEmbeddedViewManager.h"
#import "RNAirshipEmbeddedView.h"

#import <React/RCTBridge.h>
#import <React/RCTUIManager.h>

@implementation RNAirshipEmbeddedViewManager
RCT_REMAP_VIEW_PROPERTY(embeddedId, embeddedID, NSString)
RCT_EXPORT_MODULE(RNAirshipEmbeddedView)

- (UIView *)view {
    return [[RNAirshipEmbeddedView alloc] init];
}

@end

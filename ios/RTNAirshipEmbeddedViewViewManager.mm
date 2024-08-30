/* Copyright Airship and Contributors */

#import "RTNAirshipEmbeddedViewManager.h"
#import "RTNAirshipEmbeddedView.h"

#import <React/RCTBridge.h>
#import <React/RCTUIManager.h>

@implementation RTNAirshipEmbeddedViewManager
RCT_REMAP_VIEW_PROPERTY(embeddedId, embeddedID, NSString)
RCT_EXPORT_MODULE(RTNAirshipEmbeddedView)

- (UIView *)view {
    return [[RTNAirshipEmbeddedView alloc] init];
}

@end

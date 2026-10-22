/* Copyright Airship and Contributors */

#import "RNAirshipEmbeddedCarouselManager.h"
#import "RNAirshipEmbeddedCarousel.h"

#import <React/RCTBridge.h>
#import <React/RCTUIManager.h>

@implementation RNAirshipEmbeddedCarouselManager
RCT_EXPORT_VIEW_PROPERTY(config, NSString)
RCT_EXPORT_VIEW_PROPERTY(page, NSInteger)
RCT_EXPORT_VIEW_PROPERTY(onStateChange, RCTBubblingEventBlock)
RCT_EXPORT_MODULE(RNAirshipEmbeddedCarousel)

- (UIView *)view {
    return [[RNAirshipEmbeddedCarousel alloc] init];
}

@end

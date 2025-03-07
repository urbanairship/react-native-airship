/* Copyright Airship and Contributors */

#import "RNAirshipMessageViewManager.h"
#import "RNAirshipMessageView.h"

#import <React/RCTBridge.h>
#import <React/RCTUIManager.h>

@implementation RNAirshipMessageViewManager

RCT_EXPORT_VIEW_PROPERTY(onLoadStarted, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onLoadFinished, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onLoadError, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onClose, RCTBubblingEventBlock)
RCT_REMAP_VIEW_PROPERTY(messageId, messageID, NSString)
RCT_EXPORT_MODULE(RNAirshipMessageView)

- (UIView *)view {
    return [[RNAirshipMessageView alloc] init];
}

@end

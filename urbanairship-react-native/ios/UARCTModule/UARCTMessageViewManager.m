/* Copyright Airship and Contributors */

#import "UARCTMessageViewManager.h"
#import "UARCTMessageView.h"

#import <React/RCTBridge.h>
#import <React/RCTUIManager.h>

@implementation UARCTMessageViewManager

RCT_EXPORT_VIEW_PROPERTY(onLoadStarted, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onLoadFinished, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onLoadError, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onClose, RCTDirectEventBlock)
RCT_REMAP_VIEW_PROPERTY(messageId, messageID, NSString)
RCT_EXPORT_MODULE(UARCTMessageView)

- (UIView *)view {
    return [[UARCTMessageView alloc] init];
}

@end

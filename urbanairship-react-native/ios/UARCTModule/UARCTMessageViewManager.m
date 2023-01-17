/* Copyright Airship and Contributors */

// Because `UARCTMessageView` is an obj-c++ file on Fabric, the view manager also
// needs to be obj-c++. This for some reason causes the build to fail on paper due to
// unresolved type in one of the RN headers. Making two files for the view manager,
// one per architecture, is a quick way to solve the issue.

#if !defined(RN_FABRIC_ENABLED)

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

#endif
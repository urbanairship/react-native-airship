/* Copyright Airship and Contributors */

#import <WebKit/WebKit.h>
#import <React/RCTView.h>

#ifndef RNAirshipEmbeddedViewNativeComponent_h
#define RNAirshipEmbeddedViewNativeComponent_h

#ifdef RCT_NEW_ARCH_ENABLED
#import <React/RCTViewComponentView.h>
#endif

NS_ASSUME_NONNULL_BEGIN

#ifdef RCT_NEW_ARCH_ENABLED
@interface RNAirshipEmbeddedView : RCTViewComponentView
#else
@interface RNAirshipEmbeddedView : RCTView
#endif

@property (nonatomic, copy) NSString *embeddedID;

@end

NS_ASSUME_NONNULL_END

#endif

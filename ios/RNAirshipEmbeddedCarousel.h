/* Copyright Airship and Contributors */

#import <WebKit/WebKit.h>
#import <React/RCTView.h>

#ifndef RNAirshipEmbeddedCarouselNativeComponent_h
#define RNAirshipEmbeddedCarouselNativeComponent_h

#ifdef RCT_NEW_ARCH_ENABLED
#import <React/RCTViewComponentView.h>
#endif

NS_ASSUME_NONNULL_BEGIN

#ifdef RCT_NEW_ARCH_ENABLED
@interface RNAirshipEmbeddedCarousel : RCTViewComponentView
#else
@interface RNAirshipEmbeddedCarousel : RCTView
#endif

@property (nonatomic, copy) NSString *config;
@property (nonatomic, assign) NSInteger page;
@property (nonatomic, copy, nullable) RCTBubblingEventBlock onStateChange;

@end

NS_ASSUME_NONNULL_END

#endif

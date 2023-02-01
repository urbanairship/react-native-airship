/* Copyright Airship and Contributors */

#import <WebKit/WebKit.h>
#import <React/RCTView.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import <React/RCTViewComponentView.h>
#endif

NS_ASSUME_NONNULL_BEGIN

#ifdef RCT_NEW_ARCH_ENABLED
@interface RTNAirshipMessageView : RCTViewComponentView
#else
@interface RTNAirshipMessageView : RCTView
#endif

@property (nonatomic, copy) RCTDirectEventBlock onLoadStarted;
@property (nonatomic, copy) RCTDirectEventBlock onLoadFinished;
@property (nonatomic, copy) RCTDirectEventBlock onLoadError;
@property (nonatomic, copy) RCTDirectEventBlock onClose;
@property (nonatomic, copy) NSString *messageID;

@end

NS_ASSUME_NONNULL_END

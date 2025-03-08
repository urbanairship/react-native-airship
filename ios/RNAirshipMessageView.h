/* Copyright Airship and Contributors */

#import <WebKit/WebKit.h>
#import <React/RCTView.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import <React/RCTViewComponentView.h>
#endif

NS_ASSUME_NONNULL_BEGIN

#ifdef RCT_NEW_ARCH_ENABLED
@interface RNAirshipMessageView : RCTViewComponentView
#else
@interface RNAirshipMessageView : RCTView
#endif

@property (nonatomic, copy) RCTBubblingEventBlock onLoadStarted;
@property (nonatomic, copy) RCTBubblingEventBlock onLoadFinished;
@property (nonatomic, copy) RCTBubblingEventBlock onLoadError;
@property (nonatomic, copy) RCTBubblingEventBlock onClose;
@property (nonatomic, copy) NSString *messageID;

@end

NS_ASSUME_NONNULL_END

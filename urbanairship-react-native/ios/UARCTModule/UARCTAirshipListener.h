/* Copyright Urban Airship and Contributors */

#import <Foundation/Foundation.h>

#if __has_include("AirshipLib.h")
#import "UAMessageCenter.h"
#import "UAInboxMessageList.h"
#else
@import AirshipKit;
#endif

#import "UARCTEventEmitter.h"


NS_ASSUME_NONNULL_BEGIN

@interface UARCTAirshipListener : NSObject<UAPushNotificationDelegate, UARegistrationDelegate, UADeepLinkDelegate, UAMessageCenterDisplayDelegate>

- (instancetype)initWithEventEmitter:(UARCTEventEmitter *)eventEmitter;

@end

NS_ASSUME_NONNULL_END

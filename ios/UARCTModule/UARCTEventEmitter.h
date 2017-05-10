/* Copyright 2017 Urban Airship and Contributors */

#import <Foundation/Foundation.h>
#import <React/RCTEventEmitter.h>
#import "AirshipLib.h"
#import "UARCTDeepLinkAction.h"

extern NSString *const NotificationPresentationAlertKey;
extern NSString *const NotificationPresentationBadgeKey;
extern NSString *const NotificationPresentationSoundKey;

@interface UARCTEventEmitter : NSObject <UARCTDeepLinkDelegate, UAPushNotificationDelegate, UARegistrationDelegate>

@property (nonatomic, weak) RCTBridge *bridge;

+ (UARCTEventEmitter *)shared;

- (void)addListener:(NSString *)eventName;
- (void)removeListeners:(NSInteger)count;

@end

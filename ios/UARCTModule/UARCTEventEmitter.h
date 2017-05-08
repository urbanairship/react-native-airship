/* Copyright 2017 Urban Airship and Contributors */


#import <Foundation/Foundation.h>
#import <React/RCTEventEmitter.h>
#import "AirshipLib.h"

@interface UARCTEventEmitter : NSObject <UAPushNotificationDelegate, UARegistrationDelegate>

@property (nonatomic, weak) RCTBridge *bridge;

+ (UARCTEventEmitter *)shared;

- (void)addListener:(NSString *)eventName;
- (void)removeListeners:(NSInteger)count;
@end

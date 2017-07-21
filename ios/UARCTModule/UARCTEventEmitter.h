/* Copyright 2017 Urban Airship and Contributors */

#import <Foundation/Foundation.h>
#import <React/RCTEventEmitter.h>
#import "AirshipLib.h"
#import "UARCTDeepLinkAction.h"

extern NSString *const UARCTNotificationPresentationAlertKey;
extern NSString *const UARCTNotificationPresentationBadgeKey;
extern NSString *const UARCTNotificationPresentationSoundKey;

/**
 * Listeners for Urban Airship events and emits them to the JS layer.
 */
@interface UARCTEventEmitter : NSObject <UARCTDeepLinkDelegate, UAPushNotificationDelegate, UARegistrationDelegate>

/**
 * The RCTBridge. Assigned by `UrbanAirshipReactModule`.
 */
@property (nonatomic, weak) RCTBridge *bridge;

/**
 * Returns the shared instance.
 * @returns the shared event emitter instance.
 */
+ (UARCTEventEmitter *)shared;

/**
 * Adds an event listener.
 * @param eventName The event name.
 */
- (void)addListener:(NSString *)eventName;

/**
 * Removes event listeners.
 * @param count The count of event listeners being removed.
 */
- (void)removeListeners:(NSInteger)count;

/**
 * Sends an inbox updated event.
 */
- (void)inboxUpdated;

@end

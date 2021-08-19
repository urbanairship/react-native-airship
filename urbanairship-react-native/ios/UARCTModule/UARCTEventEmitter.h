/* Copyright Urban Airship and Contributors */

#import <Foundation/Foundation.h>
#import <React/RCTEventEmitter.h>
#import "UARCTDeepLinkAction.h"

#if __has_include("AirshipLib.h")
#import "UAMessageCenter.h"
#import "UAInboxMessageList.h"
#else
@import Airship;
#endif

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
 * Sends an inbox updated event.
 */
- (void)inboxUpdated;

/**
 * Sends an show inbox event.
 */
- (void)showInbox;

/**
 * Sends a conversation updated event.
 */
- (void)conversationUpdated;

/**
 * Sends an open chat event
 * @param message The message
 */
- (void)openChat:(NSString *)message;

/**
 * Sends an show inbox message event.
 * @param messageID The message ID.
 */
- (void)showInboxMessage:(NSString *)messageID;

/**
 * Creates a push map for a given notification content.
 * @param content The notification content.
 * @return Push map.
 */
+ (NSMutableDictionary *)eventBodyForNotificationContent:(UANotificationContent *)content;

/**
 * Gets and removes any pending events for the given type.
 * @param type The event type.
 * @return An array of event bodies.
 */
- (NSArray *)takePendingEventsWithType:(NSString *)type;

/**
 * Called when the app starts listening for airship events.
 * @param type The event type.
 */
- (void)onAirshipListenerAddedForType:(NSString *)type;

@end

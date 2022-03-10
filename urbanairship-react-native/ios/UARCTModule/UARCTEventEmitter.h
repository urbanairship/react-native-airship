/* Copyright Urban Airship and Contributors */

#import <Foundation/Foundation.h>
#import <React/RCTEventEmitter.h>

/**
 * Listeners for Urban Airship events and emits them to the JS layer.
 */
@interface UARCTEventEmitter : NSObject

/**
 * The RCTBridge. Assigned by `UrbanAirshipReactModule`.
 */
@property (nonatomic, weak) RCTBridge *bridge;

/**
 * Returns the shared instance.
 * @returns the shared event emitter instance.
 */
+ (UARCTEventEmitter *)shared;

- (void)sendEventWithName:(NSString *)eventName;
- (void)sendEventWithName:(NSString *)eventName body:(id)body;

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

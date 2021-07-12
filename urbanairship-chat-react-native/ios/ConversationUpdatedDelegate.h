#import <Foundation/Foundation.h>
#import "UARCTEventEmitter.h"
@import Airship;

@interface ConversationUpdatedDelegate : NSObject <UAConversationDelegate>

/**
 * Returns the shared instance.
 * @returns the shared event emitter instance.
 */
+ (ConversationUpdatedDelegate *)shared;

@end


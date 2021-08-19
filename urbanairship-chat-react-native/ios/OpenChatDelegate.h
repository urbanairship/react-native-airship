#import <Foundation/Foundation.h>
#import "UARCTEventEmitter.h"
@import Airship;

@interface OpenChatDelegate : NSObject

/**
 * Returns the shared instance.
 * @returns the shared OpenChatDelegate instance.
 */
+ (OpenChatDelegate *)shared;

@end

#import <React/RCTBridgeModule.h>

@import Airship;

@interface AirshipChatModule : NSObject <RCTBridgeModule, UAConversationDelegate, UAirshipChatDelegate>

@end

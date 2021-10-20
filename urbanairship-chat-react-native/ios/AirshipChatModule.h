#import <React/RCTBridgeModule.h>

@import AirshipKit;

@interface AirshipChatModule : NSObject <RCTBridgeModule, UAConversationDelegate, UAirshipChatDelegate>

@end

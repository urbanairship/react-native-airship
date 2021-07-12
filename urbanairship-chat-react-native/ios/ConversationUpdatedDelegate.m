#import <Foundation/Foundation.h>
#import "UARCTEventEmitter.h"
@import Airship;

@interface ConversationUpdatedDelegate : NSObject <UAConversationDelegate>

@end

#pragma mark Chat
@implementation ConversationUpdatedDelegate
static ConversationUpdatedDelegate *sharedConversationDelegate_;

+ (void)load {
    sharedConversationDelegate_ = [[ConversationUpdatedDelegate alloc] init];
}

+ (ConversationUpdatedDelegate *)shared {
    return sharedConversationDelegate_;
}


- (void)onConnectionStatusChanged {
    // No event to trigger
}

- (void)onMessagesUpdated {
    [[UARCTEventEmitter shared] conversationUpdated];
}

@end


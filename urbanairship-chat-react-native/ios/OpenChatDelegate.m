#import <Foundation/Foundation.h>
#import "UARCTEventEmitter.h"
@import Airship;

@interface OpenChatDelegate : NSObject <UAirshipChatDelegate>

@end

#pragma mark Chat
@implementation OpenChatDelegate
static OpenChatDelegate *sharedOpenChatDelegate_;

+ (void)load {
    sharedOpenChatDelegate_ = [[OpenChatDelegate alloc] init];
}

+ (OpenChatDelegate *)shared {
    return sharedOpenChatDelegate_;
}

- (void)openChatWithMessage:(NSString * _Nullable)message {
    [[UARCTEventEmitter shared] openChat:message];
}

@end


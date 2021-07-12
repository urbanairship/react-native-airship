#import "AirshipChatModule.h"
#import "ConversationUpdatedDelegate.h"
@import Airship;
//todo import UARCTEventEmitter

@implementation AirshipChatModule




RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(openChat) {
    [[NSOperationQueue mainQueue] addOperationWithBlock:^ {
        [[UAirshipChat shared] openChat];
    }];
}

RCT_EXPORT_METHOD(sendMessage:(NSString *)message) {
    [[UAirshipChat shared].conversation sendMessage:message];
}

RCT_EXPORT_METHOD(sendMessageWithAttachment:(NSString *)message
                  :(NSURL *)attachmentUrl) {
    [[UAirshipChat shared].conversation sendMessage:message attachment:attachmentUrl];
}

RCT_REMAP_METHOD(getMessages,
                 getMessages_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {

    [[UAirshipChat shared].conversation fetchMessagesWithCompletionHandler:^(NSArray<UAChatMessage *> *messages) {
        NSMutableArray *mutableMessages = [messages mutableCopy];
        for (UAChatMessage *message in messages) {
            NSMutableDictionary *messageInfo = [NSMutableDictionary dictionary];
            [messageInfo setValue:message.messageID forKey:@"messageId"];
            [messageInfo setValue:message.text forKey:@"text"];
            [messageInfo setValue:message.timestamp forKey:@"createdOn"];
            if (message.direction == UAChatMessageDirectionOutgoing) {
                [messageInfo setValue:[NSNumber numberWithInt:0] forKey:@"direction"];
            } else {
                [messageInfo setValue:[NSNumber numberWithInt:1] forKey:@"direction"];
            }
            [messageInfo setValue:@(message.isDelivered) forKey:@"delivered"];
            [mutableMessages addObject:messageInfo];
        }
        resolve(mutableMessages);
      }];
}

RCT_EXPORT_METHOD(addConversationListener) {
    [UAirshipChat shared].conversation.delegate = [ConversationUpdatedDelegate shared];
}

@end

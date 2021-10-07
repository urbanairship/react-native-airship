#import "AirshipChatModule.h"
#import "UARCTEventEmitter.h"

@import AirshipKit;

static NSString * const AirshipChatModuleCustomUIKey = @"com.urbanairship.react.chat.custom_ui";


@implementation AirshipChatModule

RCT_EXPORT_MODULE()

- (instancetype)init{
    self = [super init];
    if (self) {
        if (@available(iOS 13.0, *)) {
            [UAChat shared].conversation.delegate = self;
            [self updateOpenChatDelegate];
        }
    }
    return self;
}

RCT_EXPORT_METHOD(openChat) {
    [[NSOperationQueue mainQueue] addOperationWithBlock:^ {
        if (@available(iOS 13.0, *)) {
            [[UAChat shared] openChat];
        }
    }];
}

RCT_EXPORT_METHOD(sendMessage:(NSString *)message) {
    if (@available(iOS 13.0, *)) {
        [[UAChat shared].conversation sendMessage:message];
    }
}

RCT_EXPORT_METHOD(sendMessageWithAttachment:(NSString *)message
                  :(NSURL *)attachmentUrl) {
    if (@available(iOS 13.0, *)) {
        [[UAChat shared].conversation sendMessage:message attachment:attachmentUrl];
    }
}

RCT_REMAP_METHOD(getMessages,
                 getMessages_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {

    if (@available(iOS 13.0, *)) {
        [[UAChat shared].conversation fetchMessagesWithCompletionHandler:^(NSArray<UAChatMessage *> *messages) {
            NSMutableArray *mutableMessages = [messages mutableCopy];
            for (UAChatMessage *message in messages) {
                NSMutableDictionary *messageInfo = [NSMutableDictionary dictionary];
                [messageInfo setValue:message.messageID forKey:@"messageId"];
                [messageInfo setValue:message.text forKey:@"text"];
                double timestamp = message.timestamp.timeIntervalSince1970 * 1000.0;
                [messageInfo setValue:[NSNumber numberWithDouble:timestamp] forKey:@"createdOn"];
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
    } else {
        NSError *error =  [NSError errorWithDomain:@"com.urbanairship"
                                              code:100
                                          userInfo:@{NSLocalizedDescriptionKey: @"Only available on iOS 13"}];
        reject(@"UNAVAILABLE", @"Only availlble on iOS 13", error);
    }
}

RCT_EXPORT_METHOD(setUseCustomChatUI:(BOOL)useCustomUI) {
    if (@available(iOS 13.0, *)) {
        [[NSUserDefaults standardUserDefaults] setBool:useCustomUI forKey:AirshipChatModuleCustomUIKey];
        [self updateOpenChatDelegate];
    }
}

- (void)updateOpenChatDelegate {
    if (@available(iOS 13.0, *)) {
        BOOL enabled = [[NSUserDefaults standardUserDefaults] boolForKey:AirshipChatModuleCustomUIKey];
        if (enabled) {
            [UAChat shared].openChatDelegate = self;
        } else {
            [UAChat shared].openChatDelegate = nil;
        }
    }
}

- (void)onConnectionStatusChanged {
    // No event to trigger
}

- (void)onMessagesUpdated {
    [[UARCTEventEmitter shared] conversationUpdated];
}

- (void)openChatWithMessage:(NSString * _Nullable)message {
    [[UARCTEventEmitter shared] openChat:message];
}

@end

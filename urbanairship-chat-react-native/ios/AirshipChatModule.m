#import "AirshipChatModule.h"
#import "UARCTEventEmitter.h"
#import "UARCTStorage.h"

@import AirshipKit;

NSString *const UARCTConversationUpdatedEventName = @"com.urbanairship.conversation_updated";
NSString *const UARCTOpenChatEventName = @"com.urbanairship.open_chat";

@implementation AirshipChatModule

RCT_EXPORT_MODULE()

- (dispatch_queue_t)methodQueue {
    return dispatch_get_main_queue();
}

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

- (instancetype)init{
    self = [super init];
    if (self) {
        if (UAirship.isFlying) {
            [self onAirshipReady];
        } else {
            [[NSNotificationCenter defaultCenter] addObserver:self
                                                     selector:@selector(onAirshipReady)
                                                         name:UAirship.airshipReadyNotification
                                                       object:nil];
        }
    }
    return self;
}

RCT_EXPORT_METHOD(connect) {
    if (!UAirship.isFlying) {
        return;
    }

    if (@available(iOS 13.0, *)) {
        [[[UAChat shared] conversation] connect];
    }
}

RCT_EXPORT_METHOD(openChat) {
    if (!UAirship.isFlying) {
        return;
    }

    if (@available(iOS 13.0, *)) {
        [[UAChat shared] openChat];
    }
}

RCT_EXPORT_METHOD(sendMessage:(NSString *)message) {
    if (!UAirship.isFlying) {
        return;
    }

    if (@available(iOS 13.0, *)) {
        [[UAChat shared].conversation sendMessage:message];
    }
}

RCT_EXPORT_METHOD(sendMessageWithAttachment:(NSString *)message
                  :(NSURL *)attachmentUrl) {
    if (!UAirship.isFlying) {
        return;
    }

    if (@available(iOS 13.0, *)) {
        [[UAChat shared].conversation sendMessage:message attachment:attachmentUrl];
    }
}

RCT_REMAP_METHOD(getMessages,
                 getMessages_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {

    if (!UAirship.isFlying) {
        reject(@"TAKE_OFF_NOT_CALLED", @"Airship not ready, takeOff not called", nil);
        return;
    }

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
        UARCTStorage.autoLaunchChat = !useCustomUI;
        [self updateOpenChatDelegate];
    }
}

- (void)updateOpenChatDelegate {
    if (!UAirship.isFlying) {
        return;
    }

    if (@available(iOS 13.0, *)) {
        if (UARCTStorage.autoLaunchChat) {
            [UAChat shared].openChatDelegate = nil;
        } else {
            [UAChat shared].openChatDelegate = self;
        }
    }
}

- (void)onConnectionStatusChanged {
    // No event to trigger
}

- (void)onMessagesUpdated {
    [[UARCTEventEmitter shared] sendEventWithName:UARCTConversationUpdatedEventName];
}

- (void)openChatWithMessage:(NSString * _Nullable)message {
    NSMutableDictionary *body = [NSMutableDictionary dictionary];
    [body setValue:message forKey:@"message"];
    [[UARCTEventEmitter shared] sendEventWithName:UARCTOpenChatEventName body:body];
}

- (void)onAirshipReady {
    if (@available(iOS 13.0, *)) {
        [UAChat shared].conversation.delegate = self;
        [self updateOpenChatDelegate];
    }
}

@end

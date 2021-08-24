/* Copyright Urban Airship and Contributors */

#import "UARCTEventEmitter.h"

@interface UARCTEventEmitter()
@property(nonatomic, strong) NSMutableArray *pendingEvents;
@end

NSString *const UARCTPendingEventName = @"com.urbanairship.onPendingEvent";

NSString *const UARCTRegistrationEventName = @"com.urbanairship.registration";
NSString *const UARCTNotificationResponseEventName = @"com.urbanairship.notification_response";
NSString *const UARCTPushReceivedEventName= @"com.urbanairship.push_received";
NSString *const UARCTDeepLinkEventName = @"com.urbanairship.deep_link";
NSString *const UARCTOptInStatusChangedEventName = @"com.urbanairship.notification_opt_in_status";
NSString *const UARCTInboxUpdatedEventName = @"com.urbanairship.inbox_updated";
NSString *const UARCTShowInboxEventName = @"com.urbanairship.show_inbox";
NSString *const UARCTConversationUpdatedEventName = @"com.urbanairship.conversation_updated";
NSString *const UARCTOpenChatEventName = @"com.urbanairship.open_chat";

NSString *const UARCTNotificationPresentationAlertKey = @"alert";
NSString *const UARCTNotificationPresentationBadgeKey = @"badge";
NSString *const UARCTNotificationPresentationSoundKey = @"sound";

NSString *const UARCTAuthorizedNotificationSettingsAlertKey = UARCTNotificationPresentationAlertKey;
NSString *const UARCTAuthorizedNotificationSettingsBadgeKey = UARCTNotificationPresentationBadgeKey;
NSString *const UARCTAuthorizedNotificationSettingsSoundKey = UARCTNotificationPresentationSoundKey;
NSString *const UARCTAuthorizedNotificationSettingsCarPlayKey = @"carPlay";
NSString *const UARCTAuthorizedNotificationSettingsLockScreenKey = @"lockScreen";
NSString *const UARCTAuthorizedNotificationSettingsNotificationCenterKey = @"notificationCenter";

NSString *const UARCTEventNameKey = @"name";
NSString *const UARCTEventBodyKey = @"body";

@implementation UARCTEventEmitter

static UARCTEventEmitter *sharedEventEmitter_;

+ (void)load {
    sharedEventEmitter_ = [[UARCTEventEmitter alloc] init];
}

+ (UARCTEventEmitter *)shared {
    return sharedEventEmitter_;
}

- (instancetype)init {
    self = [super init];
    if (self) {
        self.pendingEvents = [NSMutableArray array];
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                 selector:@selector(channelRegistrationSucceeded:)
                                                     name:UAChannelUpdatedEvent
                                                   object:nil];
    }

    return self;
}

- (void)sendEventWithName:(NSString *)eventName {
    @synchronized(self.pendingEvents) {
        [self.pendingEvents addObject:@{ UARCTEventNameKey: eventName }];
        [self notifyPendingEvents];
    }
}

- (void)sendEventWithName:(NSString *)eventName body:(id)body {
    @synchronized(self.pendingEvents) {
        [self.pendingEvents addObject:@{ UARCTEventNameKey: eventName, UARCTEventBodyKey: body}];
        [self notifyPendingEvents];
    }
}

- (void)notifyPendingEvents {
    [self.bridge enqueueJSCall:@"RCTDeviceEventEmitter"
                        method:@"emit"
                          args:@[UARCTPendingEventName]
                    completion:nil];
}

- (NSArray *)takePendingEventsWithType:(NSString *)type {
    @synchronized (self.pendingEvents) {
        NSMutableArray *events = [NSMutableArray array];
        for (id event in [self.pendingEvents copy]) {
            if ([event[UARCTEventNameKey] isEqualToString:type]) {
                [events addObject:event[UARCTEventBodyKey]];
                [self.pendingEvents removeObject:event];
            }
        }
        return events;
    }
}

- (void)onAirshipListenerAddedForType:(NSString *)type {
    @synchronized (self.pendingEvents) {
        for (id event in [self.pendingEvents copy]) {
            if ([event[UARCTEventNameKey] isEqualToString:type]) {
                [self notifyPendingEvents];
                break;
            }
        }
    }
}

#pragma mark -
#pragma mark UARCTDeepLinkDelegate

-(void)deepLinkReceived:(NSString *)deepLink {
    id body = @{ @"deepLink" : deepLink };
    [self sendEventWithName:UARCTDeepLinkEventName body:body];
}

#pragma mark -
#pragma mark UAPushDelegate

-(void)receivedForegroundNotification:(UANotificationContent *)notificationContent
                    completionHandler:(void (^)(void))completionHandler {

    [self sendEventWithName:UARCTPushReceivedEventName body:[UARCTEventEmitter eventBodyForNotificationContent:notificationContent]];
    completionHandler();
}

-(void)receivedBackgroundNotification:(UANotificationContent *)notificationContent
                    completionHandler:(void (^)(UIBackgroundFetchResult))completionHandler {
    [self sendEventWithName:UARCTPushReceivedEventName body:[UARCTEventEmitter eventBodyForNotificationContent:notificationContent]];
    completionHandler(UIBackgroundFetchResultNoData);
}

-(void)receivedNotificationResponse:(UANotificationResponse *)notificationResponse
                  completionHandler:(void (^)(void))completionHandler {
    // Ignore dismisses for now
    if ([notificationResponse.actionIdentifier isEqualToString:UANotificationDismissActionIdentifier]) {
        completionHandler();
        return;
    }

    [self sendEventWithName:UARCTNotificationResponseEventName body:[self eventBodyForNotificationResponse:notificationResponse]];
    completionHandler();
}

#pragma mark Channel Registration Events

- (void)channelRegistrationSucceeded:(NSNotification *)notification {
    NSMutableDictionary *registrationBody = [NSMutableDictionary dictionary];

    NSString *channelID = notification.userInfo[UAChannelUpdatedEventChannelKey];
    NSString *deviceToken = [UAirship push].deviceToken;

    [registrationBody setValue:channelID forKey:@"channelId"];
    [registrationBody setValue:deviceToken forKey:@"registrationToken"];
    [self sendEventWithName:UARCTRegistrationEventName body:registrationBody];
}

#pragma mark -
#pragma mark UARegistrationDelegate

- (void)notificationAuthorizedSettingsDidChange:(UAAuthorizedNotificationSettings)authorizedSettings {
    BOOL optedIn = NO;

    BOOL alertBool = NO;
    BOOL badgeBool = NO;
    BOOL soundBool = NO;
    BOOL carPlayBool = NO;
    BOOL lockScreenBool = NO;
    BOOL notificationCenterBool = NO;

    if (authorizedSettings & UAAuthorizedNotificationSettingsAlert) {
        alertBool = YES;
    }

    if (authorizedSettings & UAAuthorizedNotificationSettingsBadge) {
        badgeBool = YES;
    }

    if (authorizedSettings & UAAuthorizedNotificationSettingsSound) {
        soundBool = YES;
    }

    if (authorizedSettings & UAAuthorizedNotificationSettingsCarPlay) {
        carPlayBool = YES;
    }

    if (authorizedSettings & UAAuthorizedNotificationSettingsLockScreen) {
        lockScreenBool = YES;
    }

    if (authorizedSettings & UAAuthorizedNotificationSettingsNotificationCenter) {
        notificationCenterBool = YES;
    }

    optedIn = authorizedSettings != UAAuthorizedNotificationSettingsNone;

    NSDictionary *body = @{  @"optIn": @(optedIn),
                             @"authorizedNotificationSettings" : @{
                                     UARCTAuthorizedNotificationSettingsAlertKey : @(alertBool),
                                     UARCTAuthorizedNotificationSettingsBadgeKey : @(badgeBool),
                                     UARCTAuthorizedNotificationSettingsSoundKey : @(soundBool),
                                     UARCTAuthorizedNotificationSettingsCarPlayKey : @(carPlayBool),
                                     UARCTAuthorizedNotificationSettingsLockScreenKey : @(lockScreenBool),
                                     UARCTAuthorizedNotificationSettingsNotificationCenterKey : @(notificationCenterBool)
                             }};

    [self sendEventWithName:UARCTOptInStatusChangedEventName body:body];
}

#pragma mark -
#pragma mark Message Center

- (void)inboxUpdated {
    NSDictionary *body = @{ @"messageUnreadCount": @([UAMessageCenter shared].messageList.unreadCount),
                            @"messageCount": @([UAMessageCenter shared].messageList.messageCount)
                            };

    [self sendEventWithName:UARCTInboxUpdatedEventName body:body];
}

- (void)showInbox {
    [self showInboxMessage:nil];
}

- (void)showInboxMessage:(NSString *)messageID {
    NSMutableDictionary *body = [NSMutableDictionary dictionary];
    [body setValue:messageID forKey:@"messageId"];

    [self sendEventWithName:UARCTShowInboxEventName body:body];
}

#pragma mark -
#pragma mark Chat

- (void)conversationUpdated {
    [self sendEventWithName:UARCTConversationUpdatedEventName];
}

- (void)openChat:(NSString *)message {
    NSMutableDictionary *body = [NSMutableDictionary dictionary];
    [body setValue:message forKey:@"message"];
    
    [self sendEventWithName:UARCTOpenChatEventName body:body];
}

#pragma mark -
#pragma mark Helper methods

- (NSMutableDictionary *)eventBodyForNotificationResponse:(UANotificationResponse *)notificationResponse {
    NSMutableDictionary *body = [NSMutableDictionary dictionary];
    [body setValue:[UARCTEventEmitter eventBodyForNotificationContent:notificationResponse.notificationContent] forKey:@"notification"];

    if ([notificationResponse.actionIdentifier isEqualToString:UANotificationDefaultActionIdentifier]) {
        [body setValue:@(YES) forKey:@"isForeground"];
    } else {
        UANotificationAction *notificationAction = [self notificationActionForCategory:notificationResponse.notificationContent.categoryIdentifier
                                                                      actionIdentifier:notificationResponse.actionIdentifier];
        BOOL isForeground = notificationAction.options & UNNotificationActionOptionForeground;

        [body setValue:@(isForeground) forKey:@"isForeground"];
        [body setValue:notificationResponse.actionIdentifier forKey:@"actionId"];
    }

    return body;
}

+ (NSMutableDictionary *)eventBodyForNotificationContent:(UANotificationContent *)content {
    NSMutableDictionary *pushBody = [NSMutableDictionary dictionary];
    [pushBody setValue:content.alertBody forKey:@"alert"];
    [pushBody setValue:content.alertTitle forKey:@"title"];

    // remove extraneous key/value pairs
    NSMutableDictionary *extras = [NSMutableDictionary dictionaryWithDictionary:content.notificationInfo];

    if([[extras allKeys] containsObject:@"aps"]) {
        [extras removeObjectForKey:@"aps"];
    }

    if([[extras allKeys] containsObject:@"_"]) {
        [extras removeObjectForKey:@"_"];
    }

    if (extras.count) {
        [pushBody setValue:extras forKey:@"extras"];
    }

    if (@available(iOS 10.0, *)) {
        NSString *identifier = content.notification.request.identifier;
        [pushBody setValue:identifier forKey:@"notificationId"];
    }

    return pushBody;
}

- (UANotificationAction *)notificationActionForCategory:(NSString *)category actionIdentifier:(NSString *)identifier {
    NSSet *categories = [UAirship push].combinedCategories;

    UANotificationCategory *notificationCategory;
    UANotificationAction *notificationAction;

    for (UANotificationCategory *possibleCategory in categories) {
        if ([possibleCategory.identifier isEqualToString:category]) {
            notificationCategory = possibleCategory;
            break;
        }
    }

    if (!notificationCategory) {
        UA_LERR(@"Unknown notification category identifier %@", category);
        return nil;
    }

    NSMutableArray *possibleActions = [NSMutableArray arrayWithArray:notificationCategory.actions];

    for (UANotificationAction *possibleAction in possibleActions) {
        if ([possibleAction.identifier isEqualToString:identifier]) {
            notificationAction = possibleAction;
            break;
        }
    }

    if (!notificationAction) {
        UA_LERR(@"Unknown notification action identifier %@", identifier);
        return nil;
    }

    return notificationAction;
}

@end

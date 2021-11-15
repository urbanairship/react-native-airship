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
NSString *const UARCTOpenPreferenceCenterEventName = @"com.urbanairship.open_preference_center";
NSString *const UAChannelUpdatedEventChannelKey = @"com.urbanairship.channel.identifier";

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
                                                     name:UAChannel.channelUpdatedEvent
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
#pragma mark UADeepLinkDelegate

-(void)receivedDeepLink:(NSURL *)deepLink completionHandler:(void (^)(void))completionHandler {
    id body = @{ @"deepLink" : deepLink };
    [self sendEventWithName:UARCTDeepLinkEventName body:body];
    completionHandler();
}

#pragma mark -
#pragma mark UAPushDelegate
-(void)receivedForegroundNotification:(NSDictionary *)userInfo completionHandler:(void (^)(void))completionHandler {
    [self sendEventWithName:UARCTPushReceivedEventName body:[UARCTEventEmitter eventBodyForNotificationContent:userInfo notificationIdentifier:nil]];
    completionHandler();
}

-(void)receivedBackgroundNotification:(NSDictionary *)userInfo completionHandler:(void (^)(UIBackgroundFetchResult))completionHandler {
    [self sendEventWithName:UARCTPushReceivedEventName body:[UARCTEventEmitter eventBodyForNotificationContent:userInfo notificationIdentifier:nil]];
    completionHandler(UIBackgroundFetchResultNoData);
}

-(void)receivedNotificationResponse:(UNNotificationResponse *)notificationResponse
                  completionHandler:(void (^)(void))completionHandler {
    // Ignore dismisses for now
    if ([notificationResponse.actionIdentifier isEqualToString:UNNotificationDismissActionIdentifier]) {
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
#pragma mark Preference center

- (void)openPreferenceCenterForID:(NSString *)preferenceCenterID {
    NSMutableDictionary *body = [NSMutableDictionary dictionary];
    [body setValue:preferenceCenterID forKey:@"preferenceCenterId"];

    [self sendEventWithName:UARCTOpenPreferenceCenterEventName body:body];
}

#pragma mark -
#pragma mark Helper methods

- (NSMutableDictionary *)eventBodyForNotificationResponse:(UNNotificationResponse *)notificationResponse {
    NSMutableDictionary *body = [NSMutableDictionary dictionary];
    [body setValue:[UARCTEventEmitter eventBodyForNotificationContent:notificationResponse.notification.request.content.userInfo notificationIdentifier:notificationResponse.notification.request.identifier] forKey:@"notification"];

    if ([notificationResponse.actionIdentifier isEqualToString:UNNotificationDefaultActionIdentifier]) {
        [body setValue:@(YES) forKey:@"isForeground"];
    } else {
        UNNotificationAction *notificationAction = [self notificationActionForCategory:notificationResponse.notification.request.content.categoryIdentifier
                                                                      actionIdentifier:notificationResponse.actionIdentifier];
        BOOL isForeground = notificationAction.options & UNNotificationActionOptionForeground;

        [body setValue:@(isForeground) forKey:@"isForeground"];
        [body setValue:notificationResponse.actionIdentifier forKey:@"actionId"];
    }

    return body;
}

+ (NSMutableDictionary *)eventBodyForNotificationContent:(NSDictionary *)userInfo notificationIdentifier:(NSString *)identifier {
    NSMutableDictionary *pushBody = [NSMutableDictionary dictionary];

    // remove extraneous key/value pairs
    NSMutableDictionary *extras = [NSMutableDictionary dictionaryWithDictionary:userInfo];
    
    //Fill in the notification title, subtitle and body if exists
    if([[extras allKeys] containsObject:@"aps"]) {
        NSDictionary* aps = extras[@"aps"];
        
        if ([[aps allKeys] containsObject:@"alert"]) {
            id alert = aps[@"alert"];
            if ([alert isKindOfClass:[NSDictionary class]]) {
                [pushBody setValue:alert[@"title"] forKey:@"title"];
                [pushBody setValue:alert[@"body"] forKey:@"alert"];
                [pushBody setValue:alert[@"subtitle"] forKey:@"subtitle"];
            } else {
                [pushBody setValue:alert forKey:@"alert"];
            }
        }
        [extras removeObjectForKey:@"aps"];
    }
    
    if([[extras allKeys] containsObject:@"_"]) {
        [extras removeObjectForKey:@"_"];
    }

    //Fill in the notification extras
    if (extras.count) {
        [pushBody setValue:extras forKey:@"extras"];
    }

    //Fill in the notification identifier if exists
    if (@available(iOS 10.0, *)) {
        if (identifier) {
            [pushBody setValue:identifier forKey:@"notificationId"];
        }
    }

    return pushBody;
}

- (UNNotificationAction *)notificationActionForCategory:(NSString *)category actionIdentifier:(NSString *)identifier {
    NSSet *categories = [UAirship push].combinedCategories;

    UNNotificationCategory *notificationCategory;
    UNNotificationAction *notificationAction;

    for (UNNotificationCategory *possibleCategory in categories) {
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

    for (UNNotificationAction *possibleAction in possibleActions) {
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

/* Copyright 2017 Urban Airship and Contributors */

#import "UARCTEventEmitter.h"

@interface UARCTEventEmitter()
@property(nonatomic, strong) NSMutableArray *pendingEvents;
@property(atomic, assign) NSInteger listenerCount;
@property(nonatomic, strong) NSMutableSet *knownListeners;
@property(readonly) BOOL isObserving;
@end

NSString *const UARCTRegistrationEventName = @"com.urbanairship.registration";
NSString *const UARCTNotificationResponseEventName = @"com.urbanairship.notification_response";
NSString *const UARCTPushReceivedEventName= @"com.urbanairship.push_received";
NSString *const UARCTDeepLinkEventName = @"com.urbanairship.deep_link";
NSString *const UARCTOptInStatusChangedEventName = @"com.urbanairship.notification_opt_in_status";
NSString *const UARCTInboxUpdatedEventName = @"com.urbanairship.inbox_updated";
NSString *const UARCTShowInboxEventName = @"com.urbanairship.show_inbox";

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
        self.knownListeners = [NSMutableSet set];
    }

    return self;
}

- (void)sendEventWithName:(NSString *)eventName body:(id)body {
    @synchronized(self.knownListeners) {
        if (self.bridge && self.isObserving && [self.knownListeners containsObject:eventName]) {
            [self.bridge enqueueJSCall:@"RCTDeviceEventEmitter"
                                method:@"emit"
                                  args:body ? @[eventName, body] : @[eventName]
                            completion:NULL];

        } else {
            @synchronized(self.pendingEvents) {
                [self.pendingEvents addObject:@{ UARCTEventNameKey: eventName, UARCTEventBodyKey: body}];
            }
        }
    }
}

- (void)addListener:(NSString *)eventName {
    @synchronized(self.knownListeners) {
        self.listenerCount++;

        for (id event in [self.pendingEvents copy]) {
            if ([event[UARCTEventNameKey] isEqualToString:eventName]) {
                [self sendEventWithName:event[UARCTEventNameKey] body:event[UARCTEventBodyKey]];
                [self.pendingEvents removeObject:event];
            }
        }

        [self.knownListeners addObject:eventName];
    }
}

- (void)removeListeners:(NSInteger)count {
    @synchronized(self.knownListeners) {
        self.listenerCount = MAX(self.listenerCount - count, 0);
        if (self.listenerCount == 0) {
            @synchronized(self.knownListeners) {
                [self.knownListeners removeAllObjects];
            }
        }
    }
}

- (BOOL)isObserving {
    return self.listenerCount > 0;
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

#pragma mark -
#pragma mark UARegistrationDelegate

- (void)registrationSucceededForChannelID:(NSString *)channelID deviceToken:(NSString *)deviceToken {
    NSMutableDictionary *registrationBody = [NSMutableDictionary dictionary];
    [registrationBody setValue:channelID forKey:@"channelId"];
    [registrationBody setValue:deviceToken forKey:@"registrationToken"];
    [self sendEventWithName:UARCTRegistrationEventName body:registrationBody];
}

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
                             @"notificationOptions" : @{
                                     UARCTAuthorizedNotificationSettingsAlertKey : @(alertBool),
                                     UARCTAuthorizedNotificationSettingsBadgeKey : @(badgeBool),
                                     UARCTAuthorizedNotificationSettingsSoundKey : @(soundBool)
                             },
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
    NSDictionary *body = @{ @"messageUnreadCount": @([UAirship inbox].messageList.unreadCount),
                            @"messageCount": @([UAirship inbox].messageList.messageCount)
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

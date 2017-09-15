/* Copyright 2017 Urban Airship and Contributors */

#import "UARCTEventEmitter.h"

@interface UARCTEventEmitter()
@property(nonatomic, strong) NSMutableArray *pendingEvents;
@property(atomic, assign) NSInteger listenerCount;
@property(readonly) BOOL isObserving;
@end

NSString *const UARCTRegistrationEventName = @"com.urbanairship.registration";
NSString *const UARCTNotificationResponseEventName = @"com.urbanairship.notification_response";
NSString *const UARCTPushReceivedEventName= @"com.urbanairship.push_received";
NSString *const UARCTDeepLinkEventName = @"com.urbanairship.deep_link";
NSString *const UARCTOptInStatusChangedEventName = @"com.urbanairship.notification_opt_in_status";
NSString *const UARCTInboxUpdatedEventName = @"com.urbanairship.inbox_updated";

NSString *const UARCTNotificationPresentationAlertKey = @"alert";
NSString *const UARCTNotificationPresentationBadgeKey = @"badge";
NSString *const UARCTNotificationPresentationSoundKey = @"sound";

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
    }

    return self;
}

- (BOOL)sendEventWithName:(NSString *)eventName body:(id)body {
    if (self.bridge && self.isObserving) {
        [self.bridge enqueueJSCall:@"RCTDeviceEventEmitter"
                            method:@"emit"
                              args:body ? @[eventName, body] : @[eventName]
                        completion:NULL];

        return YES;
    }

    return NO;
}

- (void)addListener:(NSString *)eventName {
    self.listenerCount++;
    if (self.listenerCount > 0) {
        for (NSDictionary *event in self.pendingEvents) {
            [self sendEventWithName:event[@"name"] body:event[@"body"]];
        }

        [self.pendingEvents removeAllObjects];
    }
}

- (void)removeListeners:(NSInteger)count {
    self.listenerCount = MAX(self.listenerCount - count, 0);
}

- (BOOL)isObserving {
    return self.listenerCount > 0;
}

#pragma mark -
#pragma mark UARCTDeepLinkDelegate

-(void)deepLinkReceived:(NSString *)deepLink {
    id body = @{ @"deepLink" : deepLink };

    if (![self sendEventWithName:UARCTDeepLinkEventName body:body]) {
        [self.pendingEvents addObject:@{ @"name": UARCTDeepLinkEventName, @"body": body}];
    }
}

#pragma mark -
#pragma mark UAPushDelegate

-(void)receivedForegroundNotification:(UANotificationContent *)notificationContent
                    completionHandler:(void (^)(void))completionHandler {

    [self sendEventWithName:UARCTPushReceivedEventName body:[self eventBodyForNotificationContent:notificationContent]];
    completionHandler();
}

-(void)receivedBackgroundNotification:(UANotificationContent *)notificationContent
                    completionHandler:(void (^)(UIBackgroundFetchResult))completionHandler {

    [self sendEventWithName:UARCTPushReceivedEventName body:[self eventBodyForNotificationContent:notificationContent]];
    completionHandler(UIBackgroundFetchResultNoData);
}

-(void)receivedNotificationResponse:(UANotificationResponse *)notificationResponse
                  completionHandler:(void (^)(void))completionHandler {

    // Ignore dismisses for now
    if ([notificationResponse.actionIdentifier isEqualToString:UANotificationDismissActionIdentifier]) {
        completionHandler();
        return;
    }

    NSDictionary *body = [self eventBodyForNotificationResponse:notificationResponse];

    if (![self sendEventWithName:UARCTNotificationResponseEventName body:body]) {
        [self.pendingEvents addObject:@{ @"name": UARCTNotificationResponseEventName, @"body": body }];
    }

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

- (void)notificationAuthorizedOptionsDidChange:(UANotificationOptions)options {
    BOOL optedIn = NO;

    BOOL alertBool = NO;
    BOOL badgeBool = NO;
    BOOL soundBool = NO;

    if (options & UANotificationOptionAlert) {
        alertBool = YES;
    }

    if (options & UANotificationOptionBadge) {
        badgeBool = YES;
    }

    if (options & UANotificationOptionSound) {
        soundBool = YES;
    }

    optedIn = alertBool || badgeBool || soundBool;

    NSDictionary *body = @{  @"optIn": @(optedIn),
                             @"notificationOptions" : @{
                                     UARCTNotificationPresentationAlertKey : @(alertBool),
                                     UARCTNotificationPresentationBadgeKey : @(badgeBool),
                                     UARCTNotificationPresentationSoundKey : @(soundBool) }
                             };


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

#pragma mark -
#pragma mark Helper methods

- (NSMutableDictionary *)eventBodyForNotificationResponse:(UANotificationResponse *)notificationResponse {
    NSMutableDictionary *body = [NSMutableDictionary dictionary];
    [body setValue:[self eventBodyForNotificationContent:notificationResponse.notificationContent] forKey:@"notification"];

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

- (NSMutableDictionary *)eventBodyForNotificationContent:(UANotificationContent *)content {
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

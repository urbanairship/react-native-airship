/* Copyright 2017 Urban Airship and Contributors */

#import "UrbanAirshipReactModule.h"
#import "AirshipLib.h"

NSString *const UARCTRegistrationEvent = @"com.urbanairship.registration";
NSString *const UARCTNotificationResponseEvent = @"com.urbanairship.notification_response";
NSString *const UARCTPushReceivedEvent= @"com.urbanairship.push_received";

@interface UrbanAirshipReactModule()
@property(nonatomic, strong) NSMutableDictionary *pendingEvents;
@end

@implementation UrbanAirshipReactModule


- (instancetype)init {
    self = [super init];
    if (self) {
        self.pendingEvents = [NSMutableDictionary dictionary];

        if ([UAirship push].launchNotificationResponse) {
            self.pendingEvents[UARCTNotificationResponseEvent] = [self eventBodyForNotificationResponse:[UAirship push].launchNotificationResponse];
        }

    }

    return self;
}

#pragma mark -
#pragma mark Module setup

RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue {
    return dispatch_get_main_queue();
}


#pragma mark -
#pragma mark Module methods

RCT_EXPORT_METHOD(setUserNotificationsEnabled:(BOOL)enabled) {
    [UAirship push].userPushNotificationsEnabled = enabled;
}

RCT_REMAP_METHOD(isUserNotificationsEnabled,
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {

    resolve(@([UAirship push].userPushNotificationsEnabled));
}

RCT_EXPORT_METHOD(isUserNotificationsEnabled:(BOOL)enabled) {
    [UAirship push].userPushNotificationsEnabled = enabled;
}


#pragma mark -
#pragma mark Events


- (void)startObserving {
    [UAirship push].registrationDelegate = self;
    [UAirship push].pushNotificationDelegate = self;

    for (NSString *event in self.pendingEvents) {
        [self sendEventWithName:event body:self.pendingEvents[event]];
    }

    [self.pendingEvents removeAllObjects];
}

- (void)stopObserving {
    [UAirship push].registrationDelegate = nil;
    [UAirship push].pushNotificationDelegate = nil;

}

- (NSArray<NSString *> *)supportedEvents {
    return @[UARCTRegistrationEvent, UARCTPushReceivedEvent, UARCTNotificationResponseEvent];
}

#pragma mark -
#pragma mark UAPushDelegate

-(void)receivedForegroundNotification:(UANotificationContent *)notificationContent completionHandler:(void (^)())completionHandler {
    [self sendEventWithName:UARCTPushReceivedEvent body:[self eventBodyForNotificationContent:notificationContent]];
    completionHandler();
}


-(void)receivedBackgroundNotification:(UANotificationContent *)notificationContent completionHandler:(void (^)(UIBackgroundFetchResult))completionHandler {
    [self sendEventWithName:UARCTPushReceivedEvent body:[self eventBodyForNotificationContent:notificationContent]];
    completionHandler(UIBackgroundFetchResultNoData);
}

-(void)receivedNotificationResponse:(UANotificationResponse *)notificationResponse completionHandler:(void (^)())completionHandler {
    // Ignore dismisses for now
    if ([notificationResponse.actionIdentifier isEqualToString:UANotificationDismissActionIdentifier]) {
        completionHandler();
        return;
    }
    [self sendEventWithName:UARCTNotificationResponseEvent body:[self eventBodyForNotificationResponse:notificationResponse]];
    completionHandler();
}

- (UNNotificationPresentationOptions)presentationOptionsForNotification:(UNNotification *)notification {
    // TODO: provide a way to customize this value through the module
    return UNNotificationPresentationOptionAlert;
}

#pragma mark -
#pragma mark UARegistrationDelegate

- (void)registrationSucceededForChannelID:(NSString *)channelID deviceToken:(NSString *)deviceToken {
    NSMutableDictionary *registrationBody = [NSMutableDictionary dictionary];
    [registrationBody setValue:channelID forKey:@"channel"];
    [registrationBody setValue:deviceToken forKey:@"registrationToken"];
    [self sendEventWithName:UARCTRegistrationEvent body:registrationBody];
}

#pragma mark -
#pragma mark Helper methods


- (NSMutableDictionary *)eventBodyForNotificationResponse:(UANotificationResponse *)notificationResponse {
    NSMutableDictionary *body = [self eventBodyForNotificationContent:notificationResponse.notificationContent];


    if ([notificationResponse.actionIdentifier isEqualToString:UANotificationDefaultActionIdentifier]) {
        [body setValue:@(YES) forKey:@"isForeground"];
    } else {
        [body setValue:notificationResponse.actionIdentifier forKey:@"actionId"];


        UANotificationAction *notificationAction = [self notificationActionForCategory:notificationResponse.notificationContent.categoryIdentifier
                                                                      actionIdentifier:notificationResponse.actionIdentifier];

        BOOL isForeground = notificationAction.options & UNNotificationActionOptionForeground;
        [body setValue:@(isForeground) forKey:@"isForeground"];
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

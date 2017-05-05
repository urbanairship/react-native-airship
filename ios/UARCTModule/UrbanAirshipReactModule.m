/* Copyright 2017 Urban Airship and Contributors */

#import "UrbanAirshipReactModule.h"
#import "AirshipLib.h"
#import "UARCTEventEmitter.h"
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

NSString *const UARCTRegistrationEvent = @"com.urbanairship.registration";
NSString *const UARCTNotificationResponseEvent = @"com.urbanairship.notification_response";
NSString *const UARCTPushReceivedEvent= @"com.urbanairship.push_received";
NSString *const UARCTDeepLinkEvent = @"com.urbanairship.deep_link";

NSString *const NotificationPresentationAlertKey = @"alert";
NSString *const NotificationPresentationBadgeKey = @"badge";
NSString *const NotificationPresentationSoundKey = @"sound";

NSString *const PresentationOptions = @"com.urbanairship.presentation_options";

@interface UrbanAirshipReactModule()
@property(nonatomic, strong) NSMutableDictionary *pendingEvents;
@property (nonatomic, copy) NSString *deepLink;
@end

@implementation UrbanAirshipReactModule

- (instancetype)init {
    self = [super init];
    if (self) {
        self.pendingEvents = [NSMutableDictionary dictionary];

        if ([UAirship push].launchNotificationResponse) {
            self.pendingEvents[UARCTNotificationResponseEvent] = [self eventBodyForNotificationResponse:[UAirship push].launchNotificationResponse];
        }

        [self registerDeepLinkEvent];
    }

    return self;
}

#pragma mark -
#pragma mark Module setup

RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue {
    return dispatch_get_main_queue();
}

- (void)setBridge:(RCTBridge *)bridge {
    [UARCTEventEmitter shared].bridge = bridge;
}

- (RCTBridge *)bridge {
    return [UARCTEventEmitter shared].bridge;
}

#pragma mark -
#pragma mark Module methods

RCT_EXPORT_METHOD(addListener:(NSString *)eventName) {
    [[UARCTEventEmitter shared] addListener:eventName];
}

RCT_EXPORT_METHOD(removeListeners:(NSInteger)count) {
    [[UARCTEventEmitter shared] removeListeners:count];
}

RCT_EXPORT_METHOD(setUserNotificationsEnabled:(BOOL)enabled) {
    [UAirship push].userPushNotificationsEnabled = enabled;
}

RCT_REMAP_METHOD(isUserNotificationsEnabled,
                 isUserNotificationsEnabled_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {

    resolve(@([UAirship push].userPushNotificationsEnabled));
}

RCT_REMAP_METHOD(isUserNotificationsOptedIn,
                 isUserNotificationsOptedIn_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    BOOL optedIn = [UAirship push].authorizedNotificationOptions != 0;
    resolve(@(optedIn));
}

RCT_EXPORT_METHOD(setNamedUser:(NSString *)namedUser) {
    namedUser = [namedUser stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];
    [UAirship namedUser].identifier = namedUser;
}

RCT_EXPORT_METHOD(addTag:(NSString *)tag) {
    [[UAirship push] addTag:tag];
    [[UAirship push] updateRegistration];
}

RCT_EXPORT_METHOD(removeTag:(NSString *)tag) {
    [[UAirship push] removeTag:tag];
    [[UAirship push] updateRegistration];
}

RCT_REMAP_METHOD(getTags,
                 getTags_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    resolve([UAirship push].tags ?: [NSArray array]);
}

RCT_EXPORT_METHOD(addTag:(NSArray *)tags group:(NSString *)group) {
    [[UAirship push] addTags:tags group:group];
    [[UAirship push] updateRegistration];
}

RCT_EXPORT_METHOD(removeTag:(NSArray *)tags group:(NSString *)group) {
    [[UAirship push] removeTags:tags group:group];
    [[UAirship push] updateRegistration];
}

RCT_EXPORT_METHOD(setAnalyticsEnabled:(BOOL)enabled) {
    [UAirship shared].analytics.enabled = enabled;
}

RCT_REMAP_METHOD(isAnalyticsEnabled,
                 isAnalyticsEnabled_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    resolve(@([UAirship shared].analytics.enabled));
}

RCT_REMAP_METHOD(getChannelId,
                 getChannelId_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    resolve([UAirship push].channelID);
}

RCT_REMAP_METHOD(associateIdentifier,
                 identifier:(NSString *)identifier
                 key:(NSString *)key) {
    UAAssociatedIdentifiers *identifiers = [[UAirship shared].analytics currentAssociatedDeviceIdentifiers];
    [identifiers setIdentifier:identifier forKey:key];
    [[UAirship shared].analytics associateDeviceIdentifiers:identifiers];
}

RCT_EXPORT_METHOD(setLocationEnabled:(BOOL)enabled) {
    [UAirship location].locationUpdatesEnabled = enabled;
}

RCT_REMAP_METHOD(isLocationEnabled,
                 isLocationEnabled_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    resolve(@([UAirship location].isLocationUpdatesEnabled));
}

RCT_REMAP_METHOD(isBackgroundLocationAllowed,
                 isBackgroundLocationAllowed_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    resolve(@([UAirship location].isBackgroundLocationUpdatesAllowed));
}

RCT_EXPORT_METHOD(setBackgroundLocationAllowed:(BOOL)enabled) {
    [UAirship location].backgroundLocationUpdatesAllowed = enabled;
}

RCT_REMAP_METHOD(runAction,
                 name:(NSString *)name
                 value:(NSString *)value
                 runAction_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {

    [UAActionRunner runActionWithName:name
                                value:value
                            situation:UASituationManualInvocation
                    completionHandler:^(UAActionResult *actionResult) {

                        NSString *resultString;
                        NSString *code;
                        NSString *errorMessage;
                        NSError *error;

                        switch (actionResult.status) {
                            case UAActionStatusCompleted:
                            {
                                if (actionResult.value) {
                                    //if the action completed with a result value, serialize into JSON
                                    //accepting fragments so we can write lower level JSON values
                                    resultString = [NSJSONSerialization stringWithObject:actionResult.value acceptingFragments:YES error:&error];
                                    // If there was an error serializing, fall back to a string description.
                                    if (error) {
                                        error = error;
                                        UA_LDEBUG(@"Unable to serialize result value %@, falling back to string description", actionResult.value);
                                        // JSONify the result string
                                        resultString = [NSJSONSerialization stringWithObject:[actionResult.value description] acceptingFragments:YES];
                                    }
                                }
                                //in the case where there is no result value, pass null
                                resultString = resultString ?: @"null";
                                break;
                            }
                            case UAActionStatusActionNotFound:
                                errorMessage = [NSString stringWithFormat:@"No action found with name %@, skipping action.", name];
                                code = @"STATUS_ACTION_NOT_FOUND";
                                break;
                            case UAActionStatusError:
                                errorMessage = actionResult.error.localizedDescription;
                                code = @"STATUS_EXECUTION_ERROR";
                                break;
                            case UAActionStatusArgumentsRejected:
                                code = @"STATUS_REJECTED_ARGUMENTS";
                                errorMessage = [NSString stringWithFormat:@"Action %@ rejected arguments.", name];
                                break;
                        }

                        if (actionResult.status == UAActionStatusCompleted) {
                            NSMutableDictionary *result = [NSMutableDictionary dictionary];
                            [result setValue:actionResult.value forKey:@"value"];
                            resolve(actionResult);
                        }

                        if (errorMessage) {
                            reject(code, errorMessage, error);
                        }

                    }];
}

RCT_EXPORT_METHOD(editNamedUserGroups:(NSArray *)operations) {
    UANamedUser *namedUser = [UAirship namedUser];
    for (NSDictionary *operation in [operations objectAtIndex:0]) {
        NSString *group = operation[@"group"];
        if ([operation[@"operationType"] isEqualToString:@"add"]) {
            [namedUser addTags:operation[@"tags"] group:group];
        } else if ([operation[@"operationType"] isEqualToString:@"remove"]) {
            [namedUser removeTags:operation[@"tags"] group:group];
        }
    }

    [namedUser updateTags];
}

RCT_EXPORT_METHOD(editChannelGroups:(NSArray *)operations) {
    for (NSDictionary *operation in [operations objectAtIndex:0]) {
        NSString *group = operation[@"group"];
        if ([operation[@"operationType"] isEqualToString:@"add"]) {
            [[UAirship push] addTags:operation[@"tags"] group:group];
        } else if ([operation[@"operationType"] isEqualToString:@"remove"]) {
            [[UAirship push] removeTags:operation[@"tags"] group:group];
        }
    }

    [[UAirship push] updateRegistration];
}

RCT_EXPORT_METHOD(setForegroundPresentationOptions:(NSDictionary *)options) {
    UNNotificationPresentationOptions presentationOptions = UNNotificationPresentationOptionNone;

    if (options[NotificationPresentationAlertKey] != nil) {
        if ([options[NotificationPresentationAlertKey] boolValue]) {
            presentationOptions = presentationOptions | UNNotificationPresentationOptionAlert;
        }
    }

    if (options[NotificationPresentationBadgeKey] != nil) {
        if ([options[NotificationPresentationBadgeKey] boolValue]) {
            presentationOptions = presentationOptions | UNNotificationPresentationOptionBadge;
        }
    }

    if (options[NotificationPresentationSoundKey] != nil) {
        if ([options[NotificationPresentationSoundKey] boolValue]) {
            presentationOptions = presentationOptions | UNNotificationPresentationOptionSound;
        }
    }

    UA_LDEBUG(@"Foreground presentation options set: %lu", (unsigned long)options);

    [UAirship push].defaultPresentationOptions = presentationOptions;
    [[NSUserDefaults standardUserDefaults] setInteger:presentationOptions forKey:PresentationOptions];
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
    return @[UARCTRegistrationEvent, UARCTPushReceivedEvent, UARCTNotificationResponseEvent, UARCTDeepLinkEvent];
}

- (void)registerDeepLinkEvent {
    __weak UrbanAirshipReactModule *weakSelf = self;
    UAAction *customDLA = [UAAction actionWithBlock: ^(UAActionArguments *args, UAActionCompletionHandler handler)  {
        if ([args.value isKindOfClass:[NSURL class]]) {
            weakSelf.deepLink = [args.value absoluteString];
        } else {
            weakSelf.deepLink = args.value;
        }

        NSDictionary *data;
        data = @{ @"deepLink":weakSelf.deepLink};

        // Send DL event
        [self sendEventWithName:UARCTDeepLinkEvent body:data];

        handler([UAActionResult resultWithValue:args.value]);
    } acceptingArguments:^BOOL(UAActionArguments *arg)  {
        if (arg.situation == UASituationBackgroundPush || arg.situation == UASituationBackgroundInteractiveButton) {
            return NO;
        }

        return [arg.value isKindOfClass:[NSURL class]] || [arg.value isKindOfClass:[NSString class]];
    }];

    [[UAirship shared].actionRegistry updateAction:customDLA forEntryWithName:kUADeepLinkActionDefaultRegistryName];
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
    return (UNNotificationPresentationOptions)[[NSUserDefaults standardUserDefaults] objectForKey:PresentationOptions];
}

#pragma mark -
#pragma mark UARegistrationDelegate

- (void)registrationSucceededForChannelID:(NSString *)channelID deviceToken:(NSString *)deviceToken {
    NSMutableDictionary *registrationBody = [NSMutableDictionary dictionary];
    [registrationBody setValue:channelID forKey:@"channel"];
    [registrationBody setValue:deviceToken forKey:@"registrationToken"];
    [self sendEventWithName:UARCTRegistrationEvent body:registrationBody];
}

- (void)notificationAuthorizedOptionsDidChange:(UANotificationOptions)options {
    NSMutableDictionary *authOptionsBody = [NSMutableDictionary dictionary];

    BOOL optedIn = NO;

    if (options & (UANotificationOptionAlert | UANotificationOptionBadge | UANotificationOptionSound)) {
        optedIn = YES;
    }

    [authOptionsBody setValue:@(options) forKey:@"options"];
    [authOptionsBody setValue:@(optedIn) forKey:@"optedIn"];

    [self sendEventWithName:UARCTRegistrationEvent body:authOptionsBody];
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

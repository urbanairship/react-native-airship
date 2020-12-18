/* Copyright Urban Airship and Contributors */

#import "UrbanAirshipReactModule.h"
#import "UARCTEventEmitter.h"
#import "UARCTDeepLinkAction.h"
#import "UARCTAutopilot.h"
#import "UARCTMessageCenter.h"
#import "UARCTMessageViewController.h"

#if __has_include("AirshipLib.h")
#import "UAInAppMessageHTMLAdapter.h"
#import "UAMessageCenterResources.h"
#import "UAInboxMessage.h"
#else
@import Airship;
#endif

@interface UrbanAirshipReactModule()
@property (nonatomic, weak) UARCTMessageViewController *messageViewController;
@property (nonatomic, weak) UAInAppMessageHTMLAdapter *htmlAdapter;
@property (nonatomic, assign) BOOL factoryBlockAssigned;
@end

@implementation UrbanAirshipReactModule

NSString * const UARCTErrorDomain = @"com.urbanairship.react";

NSString *const UARCTStatusUnavailable = @"UNAVAILABLE";


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

RCT_EXPORT_METHOD(enableChannelCreation) {
    [[UAirship channel] enableChannelCreation];
}

RCT_EXPORT_METHOD(setDataCollectionEnabled:(BOOL)enabled) {
    [[UAirship shared] setDataCollectionEnabled:enabled];
}

RCT_EXPORT_METHOD(setPushTokenRegistrationEnabled:(BOOL)enabled) {
    [[UAirship push] setPushTokenRegistrationEnabled:enabled];
}

RCT_REMAP_METHOD(isUserNotificationsEnabled,
                 isUserNotificationsEnabled_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {

    resolve(@([UAirship push].userPushNotificationsEnabled));
}

RCT_REMAP_METHOD(isUserNotificationsOptedIn,
                 isUserNotificationsOptedIn_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    BOOL optedIn = [UAirship push].authorizedNotificationSettings != 0;
    resolve(@(optedIn));
}

RCT_REMAP_METHOD(enableUserPushNotifications,
                 enableUserPushNotifications_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {

    [[UAirship push] enableUserPushNotifications:^(BOOL success) {
        resolve(@(success));
    }];
}

RCT_REMAP_METHOD(isDataCollectionEnabled,
                 isDataCollectionEnabled_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {

    resolve(@([UAirship shared].isDataCollectionEnabled));
}

RCT_REMAP_METHOD(isPushTokenRegistrationEnabled,
                 isPushTokenRegistrationEnabled_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {

    resolve(@([UAirship push].pushTokenRegistrationEnabled));
}

RCT_EXPORT_METHOD(setNamedUser:(NSString *)namedUser) {
    namedUser = [namedUser stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];
    [UAirship namedUser].identifier = namedUser.length ? namedUser : nil;
}

RCT_REMAP_METHOD(getNamedUser,
                 getNamedUser_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    resolve([UAirship namedUser].identifier);
}

RCT_EXPORT_METHOD(addTag:(NSString *)tag) {
    if (tag) {
        [[UAirship channel] addTag:tag];
        [[UAirship channel] updateRegistration];
    }
}

RCT_EXPORT_METHOD(removeTag:(NSString *)tag) {
    if (tag) {
        [[UAirship channel] removeTag:tag];
        [[UAirship channel] updateRegistration];
    }
}

RCT_REMAP_METHOD(getTags,
                 getTags_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    resolve([UAirship channel].tags ?: [NSArray array]);
}

RCT_EXPORT_METHOD(setAnalyticsEnabled:(BOOL)enabled) {
    [UAirship shared].analytics.enabled = enabled;
}

RCT_REMAP_METHOD(isAnalyticsEnabled,
                 isAnalyticsEnabled_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    resolve(@([UAirship shared].analytics.enabled));
}

RCT_EXPORT_METHOD(trackScreen:(NSString *)screen) {
    [[UAirship shared].analytics trackScreen:screen];
}

RCT_REMAP_METHOD(getChannelId,
                 getChannelId_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    resolve([UAirship channel].identifier);
}

RCT_REMAP_METHOD(getRegistrationToken,
                 getRegistrationToken_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    resolve([UAirship push].deviceToken);
}

RCT_REMAP_METHOD(associateIdentifier,
                 key:(NSString *)key
                 identifier:(NSString *)identifier) {
    UAAssociatedIdentifiers *identifiers = [[UAirship shared].analytics currentAssociatedDeviceIdentifiers];
    [identifiers setIdentifier:identifier forKey:key];
    [[UAirship shared].analytics associateDeviceIdentifiers:identifiers];
}

RCT_REMAP_METHOD(runAction,
                 name:(NSString *)name
                 value:(id)value
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

RCT_EXPORT_METHOD(editNamedUserTagGroups:(NSArray *)operations) {
    UANamedUser *namedUser = [UAirship namedUser];
    for (NSDictionary *operation in operations) {
        NSString *group = operation[@"group"];
        if ([operation[@"operationType"] isEqualToString:@"add"]) {
            [namedUser addTags:operation[@"tags"] group:group];
        } else if ([operation[@"operationType"] isEqualToString:@"remove"]) {
            [namedUser removeTags:operation[@"tags"] group:group];
        } else if ([operation[@"operationType"] isEqualToString:@"set"]) {
            [namedUser setTags:operation[@"tags"] group:group];
        }
    }

    [namedUser updateTags];
}

RCT_EXPORT_METHOD(editChannelTagGroups:(NSArray *)operations) {
    for (NSDictionary *operation in operations) {
        NSString *group = [operation objectForKey:@"group"];
        if ([operation[@"operationType"] isEqualToString:@"add"]) {
            [[UAirship channel] addTags:operation[@"tags"] group:group];
        } else if ([operation[@"operationType"] isEqualToString:@"remove"]) {
            [[UAirship channel] removeTags:operation[@"tags"] group:group];
        } else if ([operation[@"operationType"] isEqualToString:@"set"]) {
            [[UAirship channel] setTags:operation[@"tags"] group:group];
        }
    }

    [[UAirship push] updateRegistration];
}

RCT_EXPORT_METHOD(editChannelAttributes:(NSArray *)operations) {
    UAAttributeMutations *mutations = [self mutationsWithOperations:operations];
    [[UAirship channel] applyAttributeMutations:mutations];
}

RCT_EXPORT_METHOD(editNamedUserAttributes:(NSArray *)operations) {
    UAAttributeMutations *mutations = [self mutationsWithOperations:operations];
    [[UAirship namedUser] applyAttributeMutations:mutations];
}

RCT_EXPORT_METHOD(setForegroundPresentationOptions:(NSDictionary *)options) {
    UNNotificationPresentationOptions presentationOptions = UNNotificationPresentationOptionNone;

    if (options[UARCTNotificationPresentationAlertKey] != nil) {
        if ([options[UARCTNotificationPresentationAlertKey] boolValue]) {
            presentationOptions = presentationOptions | UNNotificationPresentationOptionAlert;
        }
    }

    if (options[UARCTNotificationPresentationBadgeKey] != nil) {
        if ([options[UARCTNotificationPresentationBadgeKey] boolValue]) {
            presentationOptions = presentationOptions | UNNotificationPresentationOptionBadge;
        }
    }

    if (options[UARCTNotificationPresentationSoundKey] != nil) {
        if ([options[UARCTNotificationPresentationSoundKey] boolValue]) {
            presentationOptions = presentationOptions | UNNotificationPresentationOptionSound;
        }
    }

    UA_LDEBUG(@"Foreground presentation options set: %lu from dictionary: %@", (unsigned long)presentationOptions, options);

    [UAirship push].defaultPresentationOptions = presentationOptions;
    [[NSUserDefaults standardUserDefaults] setInteger:presentationOptions
                                               forKey:UARCTPresentationOptionsStorageKey];
}

RCT_EXPORT_METHOD(setAutobadgeEnabled:(BOOL)enabled) {
    [UAirship push].autobadgeEnabled = enabled;
}

RCT_REMAP_METHOD(isAutobadgeEnabled,
                 isAutobadgeEnabled_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {

    resolve(@([UAirship push].isAutobadgeEnabled));
}

RCT_EXPORT_METHOD(setBadgeNumber:(NSInteger)badgeNumber) {
    [[UAirship push] setBadgeNumber:badgeNumber];
}

RCT_REMAP_METHOD(getBadgeNumber,
                 getBadgeNumber_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    resolve(@([UIApplication sharedApplication].applicationIconBadgeNumber));
}

RCT_EXPORT_METHOD(displayMessageCenter) {
    dispatch_async(dispatch_get_main_queue(), ^{
        [[UAMessageCenter shared] display];
    });
}

RCT_EXPORT_METHOD(dismissMessageCenter) {
    dispatch_async(dispatch_get_main_queue(), ^{
        [[UAMessageCenter shared] dismiss];
    });
}

RCT_REMAP_METHOD(displayMessage,
                 messageId:(NSString *)messageId
                 displayMessage_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    UARCTMessageViewController *mvc = [[UARCTMessageViewController alloc] initWithNibName:@"UADefaultMessageCenterMessageViewController" bundle:[UAMessageCenterResources bundle]];
    [mvc loadMessageForID:messageId];

    UINavigationController *navController =  [[UINavigationController alloc] initWithRootViewController:mvc];
    self.messageViewController = mvc;

    dispatch_async(dispatch_get_main_queue(), ^{
        [[UIApplication sharedApplication].keyWindow.rootViewController presentViewController:navController animated:YES completion:nil];
    });
}

RCT_REMAP_METHOD(dismissMessage,
                 dismissMessage_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {

    dispatch_async(dispatch_get_main_queue(), ^{
        [self.messageViewController dismissViewControllerAnimated:YES completion:nil];
        self.messageViewController = nil;
    });
}

RCT_REMAP_METHOD(getInboxMessages,
                 getInboxMessages_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {

    NSMutableArray *messages = [NSMutableArray array];
    for (UAInboxMessage *message in [UAMessageCenter shared].messageList.messages) {

        NSDictionary *icons = [message.rawMessageObject objectForKey:@"icons"];
        NSString *iconUrl = [icons objectForKey:@"list_icon"];
        NSNumber *sentDate = @([message.messageSent timeIntervalSince1970] * 1000);

        NSMutableDictionary *messageInfo = [NSMutableDictionary dictionary];
        [messageInfo setValue:message.title forKey:@"title"];
        [messageInfo setValue:message.messageID forKey:@"id"];
        [messageInfo setValue:sentDate forKey:@"sentDate"];
        [messageInfo setValue:iconUrl forKey:@"listIconUrl"];
        [messageInfo setValue:message.unread ? @NO : @YES  forKey:@"isRead"];
        [messageInfo setValue:message.extra forKey:@"extras"];
        [messageInfo setObject:message.deleted ? @NO : @YES forKey:@"isDeleted"];

        [messages addObject:messageInfo];
    }

    resolve(messages);
}

RCT_REMAP_METHOD(deleteInboxMessage,
                 messageId:(NSString *)messageId
                 deleteMessage_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {

    UAInboxMessage *message = [[UAMessageCenter shared].messageList messageForID:messageId];

    if (!message) {
        NSError *error =  [NSError errorWithDomain:UARCTErrorDomain
                                              code:UARCTErrorCodeMessageNotFound
                                          userInfo:@{NSLocalizedDescriptionKey:UARCTErrorDescriptionMessageNotFound}];

        reject(UARCTStatusMessageNotFound, UARCTErrorDescriptionMessageNotFound, error);
    } else {
        [[UAMessageCenter shared].messageList markMessagesDeleted:@[message] completionHandler:^(){
            resolve(@YES);
        }];
    }
}

RCT_REMAP_METHOD(markInboxMessageRead,
                 messageId:(NSString *)messageId
                 markMessageRead_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {

    UAInboxMessage *message = [[UAMessageCenter shared].messageList messageForID:messageId];

    if (!message) {
        NSError *error =  [NSError errorWithDomain:UARCTErrorDomain
                                              code:UARCTErrorCodeMessageNotFound
                                          userInfo:@{NSLocalizedDescriptionKey:UARCTErrorDescriptionMessageNotFound}];

        reject(UARCTStatusMessageNotFound, UARCTErrorDescriptionMessageNotFound, error);
    } else {
        [[UAMessageCenter shared].messageList markMessagesRead:@[message] completionHandler:^(){
            resolve(@YES);
        }];
    }
}

RCT_REMAP_METHOD(refreshInbox,
                 refreshInbox_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {

    [[UAMessageCenter shared].messageList retrieveMessageListWithSuccessBlock:^(){
        resolve(@YES);
    } withFailureBlock:^(){
        NSError *error =  [NSError errorWithDomain:UARCTErrorDomain
                                              code:UARCTErrorCodeInboxRefreshFailed
                                          userInfo:@{NSLocalizedDescriptionKey:UARCTErrorDescriptionInboxRefreshFailed}];
        reject(UARCTStatusInboxRefreshFailed, UARCTErrorDescriptionInboxRefreshFailed, error);
    }];
}

RCT_EXPORT_METHOD(setAutoLaunchDefaultMessageCenter:(BOOL)enabled) {
    [[NSUserDefaults standardUserDefaults] setBool:enabled forKey:UARCTAutoLaunchMessageCenterKey];
}

RCT_EXPORT_METHOD(clearNotifications) {
    [[UNUserNotificationCenter currentNotificationCenter] removeAllDeliveredNotifications];
}

RCT_EXPORT_METHOD(clearNotification:(NSString *)identifier) {
    if (identifier) {
        [[UNUserNotificationCenter currentNotificationCenter] removeDeliveredNotificationsWithIdentifiers:@[identifier]];
    }
}

RCT_REMAP_METHOD(getActiveNotifications,
                 getNotifications_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    [[UNUserNotificationCenter currentNotificationCenter] getDeliveredNotificationsWithCompletionHandler:^(NSArray<UNNotification *> * _Nonnull notifications) {
        NSMutableArray *result = [NSMutableArray array];
        for(UNNotification *unnotification in notifications) {
            UANotificationContent *content = [UANotificationContent notificationWithUNNotification:unnotification];
            [result addObject:[UARCTEventEmitter eventBodyForNotificationContent:content]];
        }

        resolve(result);
    }];
}

#pragma mark -
#pragma mark Helper methods

- (UAAttributeMutations *)mutationsWithOperations:(NSArray *)operations {
    UAAttributeMutations *mutations = [UAAttributeMutations mutations];

    for (NSDictionary *operation in operations) {
        NSString *action = operation[@"action"];
        NSString *name = operation[@"key"];
        id value = operation[@"value"];

        if ([action isEqualToString:@"set"]) {
            NSString *valueType = operation[@"type"];
                if ([valueType isEqualToString:@"string"]) {
                    [mutations setString:value forAttribute:name];
                } else if ([valueType isEqualToString:@"number"]) {
                    [mutations setNumber:value forAttribute:name];
                } else if ([valueType isEqualToString:@"date"]) {
                    // JavaScript's date type doesn't pass through the JS to native bridge. Dates are instead serialized as milliseconds since epoch.
                    NSDate *date = [NSDate dateWithTimeIntervalSince1970:[(NSNumber *)value doubleValue] / 1000.0];
                    [mutations setDate:date forAttribute:name];
                } else {
                    UA_LWARN("Unknown channel attribute type: %@", valueType);
                }
        } else if ([action isEqualToString:@"remove"]) {
            [mutations removeAttribute:name];
        }
    }
    return mutations;
}

@end

/* Copyright Urban Airship and Contributors */

#import "UrbanAirshipReactModule.h"
#import "UARCTEventEmitter.h"
#import "UARCTDeepLinkAction.h"
#import "UARCTAutopilot.h"
#import "UARCTMessageCenter.h"
#import "UARCTMessageViewController.h"

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
    [[UAirship push] enableChannelCreation];
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
        [[UAirship push] addTag:tag];
        [[UAirship push] updateRegistration];
    }
}

RCT_EXPORT_METHOD(removeTag:(NSString *)tag) {
    if (tag) {
        [[UAirship push] removeTag:tag];
        [[UAirship push] updateRegistration];
    }
}

RCT_REMAP_METHOD(getTags,
                 getTags_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    resolve([UAirship push].tags ?: [NSArray array]);
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

RCT_EXPORT_METHOD(setLocationEnabled:(BOOL)enabled) {
    [UAirship shared].locationProviderDelegate.locationUpdatesEnabled = enabled;
}

RCT_REMAP_METHOD(isLocationEnabled,
                 isLocationEnabled_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    resolve(@([UAirship shared].locationProviderDelegate.isLocationUpdatesEnabled));
}

RCT_REMAP_METHOD(isBackgroundLocationAllowed,
                 isBackgroundLocationAllowed_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    resolve(@([UAirship shared].locationProviderDelegate.isBackgroundLocationUpdatesAllowed));
}

RCT_EXPORT_METHOD(setBackgroundLocationAllowed:(BOOL)enabled) {
    [UAirship shared].locationProviderDelegate.backgroundLocationUpdatesAllowed = enabled;
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
            [[UAirship push] addTags:operation[@"tags"] group:group];
        } else if ([operation[@"operationType"] isEqualToString:@"remove"]) {
            [[UAirship push] removeTags:operation[@"tags"] group:group];
        } else if ([operation[@"operationType"] isEqualToString:@"set"]) {
            [[UAirship push] setTags:operation[@"tags"] group:group];
        }
    }

    [[UAirship push] updateRegistration];
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

    UA_LDEBUG(@"Foreground presentation options set: %lu", (unsigned long)options);

    [UAirship push].defaultPresentationOptions = presentationOptions;
    [[NSUserDefaults standardUserDefaults] setInteger:presentationOptions
                                               forKey:UARCTPresentationOptionsStorageKey];
}


RCT_EXPORT_METHOD(setQuietTimeEnabled:(BOOL)enabled) {
    [UAirship push].quietTimeEnabled = enabled;
}

RCT_REMAP_METHOD(isQuietTimeEnabled,
                 isQuietTimeEnabled_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    resolve(@([UAirship push].isQuietTimeEnabled));
}


RCT_REMAP_METHOD(getQuietTime,
                 getQuietTime_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {

    NSDictionary *quietTimeDictionary = [UAirship push].quietTime;

    if (quietTimeDictionary) {
        NSString *start = [quietTimeDictionary objectForKey:@"start"];
        NSString *end = [quietTimeDictionary objectForKey:@"end"];

        NSDateFormatter *df = [NSDateFormatter new];
        df.locale = [[NSLocale alloc] initWithLocaleIdentifier:@"en_US_POSIX"];
        df.dateFormat = @"HH:mm";

        NSDate *startDate = [df dateFromString:start];
        NSDate *endDate = [df dateFromString:end];

        // these will be nil if the dateformatter can't make sense of either string
        if (startDate && endDate) {
            NSCalendar *gregorian = [[NSCalendar alloc] initWithCalendarIdentifier:NSCalendarIdentifierGregorian];
            NSDateComponents *startComponents = [gregorian components:NSCalendarUnitHour|NSCalendarUnitMinute fromDate:startDate];
            NSDateComponents *endComponents = [gregorian components:NSCalendarUnitHour|NSCalendarUnitMinute fromDate:endDate];

            resolve(@{ @"startHour": @(startComponents.hour),
                       @"startMinute": @(startComponents.minute),
                       @"endHour": @(endComponents.hour),
                       @"endMinute": @(endComponents.minute) });

        }
    } else {
        resolve(@{ @"startHour": @(0),
                   @"startMinute": @(0),
                   @"endHour": @(0),
                   @"endMinute": @(0) });
    }

}

RCT_EXPORT_METHOD(setQuietTime:(NSDictionary *)quietTime) {
    [[UAirship push] setQuietTimeStartHour:[quietTime[@"startHour"] integerValue]
                               startMinute:[quietTime[@"startMinute"] integerValue]
                                   endHour:[quietTime[@"endHour"] integerValue]
                                 endMinute:[quietTime[@"endMinute"] integerValue]];

    [[UAirship push] updateRegistration];
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
        [[UAirship messageCenter] display];
    });
}

RCT_EXPORT_METHOD(dismissMessageCenter) {
    dispatch_async(dispatch_get_main_queue(), ^{
        [[UAirship messageCenter] dismiss];
    });
}

RCT_REMAP_METHOD(displayMessage,
                 messageId:(NSString *)messageId
                 overlay:(BOOL)overlay
                 displayMessage_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {

    if (overlay) {
        [self displayOverlayMessage:messageId];
    } else {
        UARCTMessageViewController *mvc = [[UARCTMessageViewController alloc] initWithNibName:@"UAMessageCenterMessageViewController" bundle:[UAirship resources]];
        [mvc loadMessageForID:messageId onlyIfChanged:YES onError:nil];

        UINavigationController *navController =  [[UINavigationController alloc] initWithRootViewController:mvc];
        self.messageViewController = mvc;

        dispatch_async(dispatch_get_main_queue(), ^{
            [[UIApplication sharedApplication].keyWindow.rootViewController presentViewController:navController animated:YES completion:nil];
        });
    }
}

RCT_REMAP_METHOD(dismissMessage,
                 overlay:(BOOL)overlay
                 dismissMessage_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    if (overlay) {
        dispatch_async(dispatch_get_main_queue(), ^{
            [self closeOverlayMessage];
        });

    } else {
        dispatch_async(dispatch_get_main_queue(), ^{
            [self.messageViewController dismissViewControllerAnimated:YES completion:nil];
            self.messageViewController = nil;
        });
    }
}

RCT_REMAP_METHOD(getInboxMessages,
                 getInboxMessages_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {

    NSMutableArray *messages = [NSMutableArray array];
    for (UAInboxMessage *message in [UAirship inbox].messageList.messages) {

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

    UAInboxMessage *message = [[UAirship inbox].messageList messageForID:messageId];

    if (!message) {
        NSError *error =  [NSError errorWithDomain:UARCTErrorDomain
                                              code:UARCTErrorCodeMessageNotFound
                                          userInfo:@{NSLocalizedDescriptionKey:UARCTErrorDescriptionMessageNotFound}];

        reject(UARCTStatusMessageNotFound, UARCTErrorDescriptionMessageNotFound, error);
    } else {
        [[UAirship inbox].messageList markMessagesDeleted:@[message] completionHandler:^(){
            resolve(@YES);
        }];
    }
}

RCT_REMAP_METHOD(markInboxMessageRead,
                 messageId:(NSString *)messageId
                 markMessageRead_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {

    UAInboxMessage *message = [[UAirship inbox].messageList messageForID:messageId];

    if (!message) {
        NSError *error =  [NSError errorWithDomain:UARCTErrorDomain
                                              code:UARCTErrorCodeMessageNotFound
                                          userInfo:@{NSLocalizedDescriptionKey:UARCTErrorDescriptionMessageNotFound}];

        reject(UARCTStatusMessageNotFound, UARCTErrorDescriptionMessageNotFound, error);
    } else {
        [[UAirship inbox].messageList markMessagesRead:@[message] completionHandler:^(){
            resolve(@YES);
        }];
    }
}

RCT_REMAP_METHOD(refreshInbox,
                 refreshInbox_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {

    [[UAirship inbox].messageList retrieveMessageListWithSuccessBlock:^(){
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
    [[NSUserDefaults standardUserDefaults] synchronize];
}

RCT_EXPORT_METHOD(clearNotifications) {
    if (@available(iOS 10.0, *)) {
        [[UNUserNotificationCenter currentNotificationCenter] removeAllDeliveredNotifications];
    }
}

RCT_EXPORT_METHOD(clearNotification:(NSString *)identifier) {
    if (@available(iOS 10.0, *)) {
        if (identifier) {
            [[UNUserNotificationCenter currentNotificationCenter] removeDeliveredNotificationsWithIdentifiers:@[identifier]];
        }
    }
}

RCT_REMAP_METHOD(getActiveNotifications,
                 getNotifications_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {

    if (@available(iOS 10.0, *)) {
        [[UNUserNotificationCenter currentNotificationCenter] getDeliveredNotificationsWithCompletionHandler:^(NSArray<UNNotification *> * _Nonnull notifications) {

            NSMutableArray *result = [NSMutableArray array];
            for(UNNotification *unnotification in notifications) {
                UANotificationContent *content = [UANotificationContent notificationWithUNNotification:unnotification];
                [result addObject:[UARCTEventEmitter eventBodyForNotificationContent:content]];
            }

            resolve(result);
        }];
    } else {
        NSError *error =  [NSError errorWithDomain:UARCTErrorDomain
                                              code:0
                                          userInfo:@{NSLocalizedDescriptionKey:@"Only available on iOS 10+"}];

        reject(UARCTStatusUnavailable, @"Only available on iOS 10+", error);
    }
}

#pragma mark -
#pragma mark Helper methods

- (void)displayOverlayMessage:(NSString *)messageId {
    if (!self.factoryBlockAssigned) {
        [[UAirship inAppMessageManager] setFactoryBlock:^id<UAInAppMessageAdapterProtocol> _Nonnull(UAInAppMessage * _Nonnull message) {
            UAInAppMessageHTMLAdapter *adapter = [UAInAppMessageHTMLAdapter adapterForMessage:message];
            UAInAppMessageHTMLDisplayContent *displayContent = (UAInAppMessageHTMLDisplayContent *) message.displayContent;
            NSURL *url = [NSURL URLWithString:displayContent.url];

            if ([url.scheme isEqualToString:@"message"]) {
                self.htmlAdapter = adapter;
            }

            return adapter;
        } forDisplayType:UAInAppMessageDisplayTypeHTML];

        self.factoryBlockAssigned = YES;
    }

    [UAActionRunner runActionWithName:kUAOverlayInboxMessageActionDefaultRegistryName
                                value:messageId
                            situation:UASituationManualInvocation];
}


- (void)closeOverlayMessage {
    UIViewController *vc = [self.htmlAdapter valueForKey:@"htmlViewController"];
# pragma clang diagnostic push
# pragma clang diagnostic ignored "-Warc-performSelector-leaks"
    [vc performSelector:NSSelectorFromString(@"dismissWithoutResolution")];
# pragma clang diagnostic pop
}

@end

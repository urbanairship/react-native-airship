/* Copyright Airship and Contributors */

#import "RNAirship.h"

#import "RNAirshipBridge.h"

@implementation RNAirship
+ (NSString *)moduleName
{
  return @"RNAirship";
}

- (NSArray<NSString *> *)supportedEvents {
    return @[
        [RNAirshipBridgeClass() pendingEventsEventName],
        [RNAirshipBridgeClass() overridePresentationOptionsEventName],
        [RNAirshipBridgeClass() pendingEmbeddedUpdated]
    ];
}

-(void)startObserving {
    __weak RNAirship *weakSelf = self;
    
    [RNAirshipBridgeShared() setNotifier:^(NSString *name, NSDictionary<NSString *,id> *body) {
        [weakSelf sendEventWithName:name body:body];
    }];
}

-(void)stopObserving {
    [RNAirshipBridgeShared() setNotifier:nil];
}

- (void)setBridge:(RCTBridge *)bridge {
    self.reactBridge = bridge;

    [RNAirshipBridgeShared() attemptTakeOff];
}

- (RCTBridge *)bridge {
    return self.reactBridge;
}

#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
(const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeRNAirshipSpecJSI>(params);
}
#endif

- (dispatch_queue_t)methodQueue {
    return dispatch_get_main_queue();
}

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

RCT_EXPORT_METHOD(airshipListenerAdded:(NSString *)eventName) {
    [RNAirshipBridgeShared() onListenerAddedWithEventName:eventName];
}

RCT_REMAP_METHOD(takePendingEvents,
                 takePendingEvents:(NSString *)eventName
                 isHeadlessJS:(BOOL)isHeadlessJS
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    // isHeadlessJS is always false for iOS. It's an Android only flag.
    [RNAirshipBridgeShared() takePendingEventsWithEventName:eventName completionHandler:^(NSArray *result) {
        resolve(result);
    }];
}

RCT_REMAP_METHOD(takeOff,
                 takeOff:(NSDictionary *)config
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    id result = [RNAirshipBridgeShared() takeOffWithJson:config
                                                     error:&error];
    
    [self handleResult:result error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(isFlying,
                 isFlying:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    resolve(@([RNAirshipBridgeShared() isFlying]));
}

RCT_REMAP_METHOD(getLaunchDeepLink,
                 getLaunchDeepLink:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    [RNAirshipBridgeShared() getLaunchDeepLinkWithCompletionHandler:^(NSString *result) {
        resolve(result);
    }];
}

RCT_REMAP_METHOD(channelAddTag,
                 channelAddTag:(NSString *)tag
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [RNAirshipBridgeShared() channelAddTag:tag error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(channelRemoveTag,
                 channelRemoveTag:(NSString *)tag
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [RNAirshipBridgeShared() channelRemoveTag:tag error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(channelEditTags,
                 channelEditTags:(NSArray *)operations
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [RNAirshipBridgeShared() channelEditTagsWithJson:operations
                                                      error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(channelEnableChannelCreation,
                 channelEnableChannelCreation:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [RNAirshipBridgeShared() channelEnableChannelCreationAndReturnError:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(pushGetActiveNotifications,
                 pushGetActiveNotifications:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    [RNAirshipBridgeShared() pushGetActiveNotificationsWithCompletionHandler:^(NSArray<NSDictionary<NSString *,id> *> *result, NSError *error) {
        [self handleResult:result error:error resolve:resolve reject:reject];
    }];
}

RCT_EXPORT_METHOD(pushClearNotifications) {
    [RNAirshipBridgeShared() pushClearNotifications];
}

RCT_EXPORT_METHOD(pushClearNotification:(NSString *)identifier) {
    [RNAirshipBridgeShared() pushClearNotification:identifier];
}

RCT_REMAP_METHOD(pushGetNotificationStatus,
                 pushGetNotificationStatus:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {

    [RNAirshipBridgeShared() pushGetNotificationStatusWithCompletionHandler:^(id result, NSError *error) {
        [self handleResult:result error:error resolve:resolve reject:reject];
    }];
}

RCT_REMAP_METHOD(pushGetRegistrationToken,
                 pushGetRegistrationToken:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    NSString *result = [RNAirshipBridgeShared() pushGetRegistrationTokenOrEmptyAndReturnError:&error];

    [self handleResult:result.length ? result : nil
                 error:error
               resolve:resolve
                reject:reject];
}

RCT_REMAP_METHOD(pushIsUserNotificationsEnabled,
                 pushIsUserNotificationsEnabled:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    id result = [RNAirshipBridgeShared()  pushIsUserNotificationsEnabledAndReturnError:&error];

    [self handleResult:result error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(pushSetUserNotificationsEnabled,
                 pushSetUserNotificationsEnabled:(BOOL)enabled
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [RNAirshipBridgeShared() pushSetUserNotificationsEnabled:enabled
                                                         error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(pushEnableUserNotifications,
                 pushEnableUserNotifications:(NSDictionary *)options
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    [RNAirshipBridgeShared() pushEnableUserNotificationsWithOptions:options completionHandler:^(BOOL result, NSError *error) {
        [self handleResult:@(result)
                     error:error
                   resolve:resolve
                    reject:reject];
    }];
}

RCT_REMAP_METHOD(pushAndroidIsNotificationChannelEnabled,
                 pushAndroidIsNotificationChannelEnabled:(NSString *)channel
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    reject(@"AIRSHIP_ERROR", @"Not supported on iOS", nil);
}

RCT_EXPORT_METHOD(pushAndroidSetNotificationConfig:(NSDictionary *)config) {
    // no-op
}

RCT_REMAP_METHOD(pushIosGetBadgeNumber,
                 pushIosGetBadgeNumber:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    id result = [RNAirshipBridgeShared()  pushGetBadgeNumberAndReturnError:&error];

    [self handleResult:result error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(pushIosIsAutobadgeEnabled,
                 pushIosIsAutobadgeEnabled:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    id result = [RNAirshipBridgeShared()  pushIsAutobadgeEnabledAndReturnError:&error];

    [self handleResult:result error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(pushIosSetAutobadgeEnabled,
                 pushIosSetAutobadgeEnabled:(BOOL)enabled
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [RNAirshipBridgeShared() pushSetAutobadgeEnabled:enabled
                                                 error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(pushIosSetBadgeNumber,
                 pushIosSetBadgeNumber:(double)badgeNumber
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    [RNAirshipBridgeShared() pushSetBadgeNumber:badgeNumber completionHandler:^(NSError *error) {
        [self handleResult:nil
                     error:error
                   resolve:resolve
                    reject:reject];
    }];
}

RCT_REMAP_METHOD(pushIosSetForegroundPresentationOptions,
                 pushIosSetForegroundPresentationOptions:(NSArray *)options
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [RNAirshipBridgeShared() pushSetForegroundPresentationOptionsWithNames:options
                                                                       error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(pushIosSetNotificationOptions,
                 pushIosSetNotificationOptions:(NSArray *)options
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [RNAirshipBridgeShared() pushSetNotificationOptionsWithNames:options
                                                             error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(channelEditAttributes,
                 channelEditAttributes:(NSArray *)operations
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [RNAirshipBridgeShared() channelEditAttributesWithJson:operations
                                                       error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(channelEditSubscriptionLists,
                 channelEditSubscriptionLists:(NSArray *)operations
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [RNAirshipBridgeShared() channelEditSubscriptionListsWithJson:operations
                                                              error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(channelEditTagGroups,
                 channelEditTagGroups:(NSArray *)operations
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [RNAirshipBridgeShared() channelEditTagGroupsWithJson:operations
                                                      error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}


RCT_REMAP_METHOD(channelGetChannelId,
                 channelGetChannelId:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    NSString *result = [RNAirshipBridgeShared()  channelGetChannelIdOrEmptyAndReturnError:&error];

    [self handleResult:result.length ? result : nil
                 error:error
               resolve:resolve
                reject:reject];
}

RCT_REMAP_METHOD(channelWaitForChannelId,
                 channelWaitForChannelId:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {

    [RNAirshipBridgeShared() channelWaitForChannelIdWithCompletionHandler:^(NSString *result, NSError *error) {
        [self handleResult:result
                     error:error
                   resolve:resolve
                    reject:reject];
    }];
}


RCT_REMAP_METHOD(channelGetSubscriptionLists,
                 channelGetSubscriptionLists:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [RNAirshipBridgeShared() channelGetSubscriptionListsWithCompletionHandler:^(NSArray<NSString *> *result, NSError *error) {

        [self handleResult:result
                     error:error
                   resolve:resolve
                    reject:reject];
    }];
}

RCT_REMAP_METHOD(channelGetTags,
                 channelGetTags:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    id result = [RNAirshipBridgeShared() channelGetTagsAndReturnError:&error];

    [self handleResult:result error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(actionRun,
                 actionRun:(NSDictionary *)action
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    [RNAirshipBridgeShared() actionsRunWithAction:action
                                      completionHandler:^(id result , NSError *error) {


        [self handleResult:result
                     error:error
                   resolve:resolve
                    reject:reject];
    }];
}

RCT_REMAP_METHOD(analyticsAssociateIdentifier,
                 analyticsAssociateIdentifier:(NSString *)key
                 identifier:(NSString *)identifier
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [RNAirshipBridgeShared() analyticsAssociateIdentifier:identifier
                                                        key:key
                                                      error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(analyticsTrackScreen,
                 analyticsTrackScreen:(NSString *)screen
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [RNAirshipBridgeShared() analyticsTrackScreen:screen
                                              error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(addCustomEvent,
                 addCustomEvent:(NSDictionary *)event
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [RNAirshipBridgeShared() addCustomEvent:event
                                        error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(analyticsGetSessionId,
                 analyticsGetSessionId:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    NSString *result = [RNAirshipBridgeShared() analyticsGetSessionIdAndReturnError:&error];

    [self handleResult:result
                 error:error
               resolve:resolve
                reject:reject];
}


RCT_REMAP_METHOD(contactEditAttributes,
                 contactEditAttributes:(NSArray *)operations
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [RNAirshipBridgeShared() contactEditAttributesWithJson:operations
                                                       error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(contactEditSubscriptionLists,
                 contactEditSubscriptionLists:(NSArray *)operations
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [RNAirshipBridgeShared() contactEditSubscriptionListsWithJson:operations
                                                              error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(contactEditTagGroups,
                 contactEditTagGroups:(NSArray *)operations
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [RNAirshipBridgeShared() contactEditTagGroupsWithJson:operations
                                                      error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(contactGetSubscriptionLists,
                 contactGetSubscriptionLists:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    [RNAirshipBridgeShared() contactGetSubscriptionListsWithCompletionHandler:^(NSDictionary *result, NSError *error) {

        [self handleResult:result
                     error:error
                   resolve:resolve
                    reject:reject];
    }];
}

RCT_REMAP_METHOD(contactGetNamedUserId,
                 contactGetNamedUserId:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {

    [RNAirshipBridgeShared() contactGetNamedUserIdOrEmtpyWithCompletionHandler:^(NSString *result, NSError *error) {
        [self handleResult:result.length ? result : nil
                     error:error
                   resolve:resolve
                    reject:reject];
    }];
}

RCT_REMAP_METHOD(contactIdentify,
                 contactIdentify:(NSString *)namedUser
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [RNAirshipBridgeShared() contactIdentify:namedUser
                                         error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(contactReset,
                 contactReset:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [RNAirshipBridgeShared() contactResetAndReturnError:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(contactRegisterSms,
                 contactRegisterSms:(NSString *)msisdn
                 options:(NSDictionary *)options
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [RNAirshipBridgeShared() contactRegisterSms:msisdn
                                          options:options
                                           error:&error];
    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(contactRegisterEmail,
                 contactRegisterEmail:(NSString *)address
                 options:(NSDictionary *)options
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [RNAirshipBridgeShared() contactRegisterEmail:address
                                            options:options
                                             error:&error];
    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(contactNotifyRemoteLogin,
                 contactNotifyRemoteLogin:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [RNAirshipBridgeShared() contactNotifyRemoteLoginAndReturnError:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(inAppGetDisplayInterval,
                 inAppGetDisplayInterval:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    id result = [RNAirshipBridgeShared() inAppGetDisplayIntervalAndReturnError:&error];

    [self handleResult:result error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(inAppIsPaused,
                 inAppIsPaused:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    id result = [RNAirshipBridgeShared() inAppIsPausedAndReturnError:&error];
    
    [self handleResult:result error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(inAppSetDisplayInterval,
                 inAppSetDisplayInterval:(double)milliseconds
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [RNAirshipBridgeShared() inAppSetDisplayIntervalWithMilliseconds:milliseconds
                                                                 error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(inAppSetPaused,
                 inAppSetPaused:(BOOL)paused
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [RNAirshipBridgeShared() inAppSetPaused:paused
                                        error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(inAppResendPendingEmbeddedEvent) {
    [RNAirshipBridgeShared() inAppResendPendingEmbeddedEvent];
}

RCT_REMAP_METHOD(localeClearLocaleOverride,
                 localeClearLocaleOverride:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [RNAirshipBridgeShared() localeClearLocaleOverrideAndReturnError:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(localeGetLocale,
                 localeGetLocale:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    id result = [RNAirshipBridgeShared() localeGetLocaleAndReturnError:&error];

    
    [self handleResult:result error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(localeSetLocaleOverride,
                 localeSetLocaleOverride:(NSString *)localeIdentifier
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [RNAirshipBridgeShared() localeSetLocaleOverrideWithLocaleIdentifier:localeIdentifier
                                                                     error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(messageCenterDeleteMessage,
                 messageCenterDeleteMessage:(NSString *)messageId
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    [RNAirshipBridgeShared() messageCenterDeleteMessageWithMessageId:messageId
                                                     completionHandler:^(NSError * error) {
        [self handleResult:nil error:error resolve:resolve reject:reject];
    }];
}

RCT_REMAP_METHOD(messageCenterDismiss,
                 messageCenterDismiss:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {

    NSError *error;
    [RNAirshipBridgeShared() messageCenterDismissAndReturnError:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(messageCenterDisplay,
                 messageCenterDisplay:(NSString *)messageId
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [RNAirshipBridgeShared() messageCenterDisplayWithMessageId:messageId
                                                           error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(messageCenterShowMessageCenter,
                 messageCenterShowMessageCenter:(NSString *)messageId
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [RNAirshipBridgeShared() messageCenterShowMessageCenterWithMessageId:messageId
                                                           error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(messageCenterShowMessageView,
                 messageCenterShowMessageView:(NSString *)messageId
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [RNAirshipBridgeShared() messageCenterShowMessageViewWithMessageId:messageId
                                                           error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(messageCenterGetMessages,
                 messageCenterGetMessages:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {

    [RNAirshipBridgeShared() messageCenterGetMessagesWithCompletionHandler:^(NSArray *result, NSError *error) {
        [self handleResult:result error:error resolve:resolve reject:reject];
    }];
}

RCT_REMAP_METHOD(messageCenterGetUnreadCount,
                 messageCenterGetUnreadCount:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {

    [RNAirshipBridgeShared() messageCenterGetUnreadCountWithCompletionHandler:^(double result, NSError *error) {
        [self handleResult:@(result) error:error resolve:resolve reject:reject];
    }];
}

RCT_REMAP_METHOD(messageCenterMarkMessageRead,
                 messageCenterMarkMessageRead:(NSString *)messageId
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    [RNAirshipBridgeShared() messageCenterMarkMessageReadWithMessageId:messageId
                                                       completionHandler:^(NSError * error) {
        [self handleResult:nil error:error resolve:resolve reject:reject];
    }];
}

RCT_REMAP_METHOD(messageCenterRefresh,
                 messageCenterRefresh:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    [RNAirshipBridgeShared() messageCenterRefreshWithCompletionHandler:^(NSError *error) {
        [self handleResult:nil error:error resolve:resolve reject:reject];
    }];
}

RCT_EXPORT_METHOD(messageCenterSetAutoLaunchDefaultMessageCenter:(BOOL)enabled) {
    [RNAirshipBridgeShared() messageCenterSetAutoLaunchDefaultMessageCenterWithAutoLaunch:enabled];
}

RCT_EXPORT_METHOD(preferenceCenterAutoLaunchDefaultPreferenceCenter:(NSString *)preferenceCenterId
                  autoLaunch:(BOOL)autoLaunch) {
    [RNAirshipBridgeShared() preferenceCenterAutoLaunchDefaultPreferenceCenterWithPreferenceCenterId:preferenceCenterId
                                                                                            autoLaunch:autoLaunch];
}

RCT_REMAP_METHOD(preferenceCenterDisplay,
                 preferenceCenterDisplay:(NSString *)preferenceCenterId
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {

    NSError *error;
    [RNAirshipBridgeShared() preferenceCenterDisplayWithPreferenceCenterId:preferenceCenterId
                                                                       error:&error];
    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(preferenceCenterGetConfig,
                 preferenceCenterGetConfig:(NSString *)preferenceCenterId
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {

    [RNAirshipBridgeShared() preferenceCenterGetConfigWithPreferenceCenterId:preferenceCenterId
                                                           completionHandler:^(id result, NSError *error) {
        [self handleResult:result
                     error:error
                   resolve:resolve
                    reject:reject];
    }];
}

RCT_REMAP_METHOD(privacyManagerDisableFeature,
                 privacyManagerDisableFeature:(NSArray *)features
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [RNAirshipBridgeShared() privacyManagerDisableFeatureWithFeatures:features error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(privacyManagerEnableFeature,
                 privacyManagerEnableFeature:(NSArray *)features
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [RNAirshipBridgeShared() privacyManagerEnableFeatureWithFeatures:features error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(privacyManagerGetEnabledFeatures,
                 privacyManagerGetEnabledFeatures:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    id result = [RNAirshipBridgeShared() privacyManagerGetEnabledFeaturesAndReturnError:&error];

    [self handleResult:result error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(privacyManagerIsFeatureEnabled,
                 privacyManagerIsFeatureEnabled:(NSArray *)features
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    id result = [RNAirshipBridgeShared() privacyManagerIsFeatureEnabledWithFeatures:features
                                                                                error:&error];

    [self handleResult:result error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(privacyManagerSetEnabledFeatures,
                 privacyManagerSetEnabledFeatures:(NSArray *)features
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [RNAirshipBridgeShared() privacyManagerSetEnabledFeaturesWithFeatures:features error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}


RCT_EXPORT_METHOD(pushIosIsOverridePresentationOptionsEnabled:(BOOL)enabled) {
    RNAirshipBridgeShared().overridePresentationOptionsEnabled = enabled;
}

RCT_EXPORT_METHOD(pushIosOverridePresentationOptions:(NSString *)requestID options:(NSArray *)presentationOptions) {
    [RNAirshipBridgeShared() presentationOptionOverridesResultWithRequestID:requestID presentationOptions:presentationOptions];
}

RCT_REMAP_METHOD(pushIosGetAuthorizedNotificationSettings,
                 pushIosGetAuthorizedNotificationSettings:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    id result = [RNAirshipBridgeShared() pushGetAuthorizedNotificationSettingsAndReturnError:&error];
    [self handleResult:result error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(pushIosGetAuthorizedNotificationStatus,
                 pushIosGetAuthorizedNotificationStatus:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    id result = [RNAirshipBridgeShared() pushGetAuthorizedNotificationStatusAndReturnError:&error];
    [self handleResult:result error:error resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(pushAndroidIsOverrideForegroundDisplayEnabled:(BOOL)enabled) {
    // Android only
}

RCT_EXPORT_METHOD(pushAndroidOverrideForegroundDisplay:(NSString *)requestID shouldDisplay:(BOOL)display) {
    // Android only
}

RCT_REMAP_METHOD(featureFlagManagerTrackInteraction,
                 featureFlagManagerTrackInteraction:(NSDictionary *)flag
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {


    NSError *error;
    [RNAirshipBridgeShared() featureFlagManagerTrackInteractedWithFlag:flag error:&error];
    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(featureFlagManagerFlag,
                 featureFlagManagerFlag:(NSString *)flagName
                 useResultCache:(BOOL)useResultCache
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {

    [RNAirshipBridgeShared() featureFlagManagerFlagWithFlagName:flagName
                                                   useResultCache:useResultCache
                                                completionHandler:^(id result, NSError * _Nullable error) {
        [self handleResult:result error:error resolve:resolve reject:reject];
    }];
}

RCT_REMAP_METHOD(featureFlagManagerResultCacheGetFlag,
                 featureFlagManagerResultCacheGetFlag:(NSString *)flagName
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {

    [RNAirshipBridgeShared() featureFlagManagerResultCacheGetFlagWithName:flagName
                                                completionHandler:^(id result, NSError * _Nullable error) {
        [self handleResult:result error:error resolve:resolve reject:reject];
    }];
}

RCT_REMAP_METHOD(featureFlagManagerResultCacheSetFlag,
                 featureFlagManagerResultCacheSetFlag:(NSDictionary *)flag
                 ttl:(double)ttl
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {

    [RNAirshipBridgeShared() featureFlagManagerResultCacheSetFlagWithFlag:flag
                                                                ttl:@(ttl)
                                                          completionHandler:^(NSError * _Nullable error) {
                  [self handleResult:nil error:error resolve:resolve reject:reject];
              }];
}

RCT_REMAP_METHOD(featureFlagManagerResultCacheRemoveFlag,
                 featureFlagManagerResultCacheRemoveFlag:(NSString *)flagName
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {

    [RNAirshipBridgeShared() featureFlagManagerResultCacheRemoveFlagWithName:flagName
                                                     completionHandler:^(NSError * _Nullable error) {
        [self handleResult:nil error:error resolve:resolve reject:reject];
    }];
}


RCT_REMAP_METHOD(liveActivityListAll,
                 liveActivityListAll:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {

    [RNAirshipBridgeShared() liveActivityListAllWithCompletionHandler:^(id result, NSError * _Nullable error) {
        [self handleResult:result error:error resolve:resolve reject:reject];
    }];
}

RCT_REMAP_METHOD(liveActivityList,
                 liveActivityList:(NSDictionary *)request
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {

    [RNAirshipBridgeShared() liveActivityListWithOptions:request
                                                completionHandler:^(id result, NSError * _Nullable error) {
        [self handleResult:result error:error resolve:resolve reject:reject];
    }];
}

RCT_REMAP_METHOD(liveActivityStart,
                 liveActivityStart:(NSDictionary *)request
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {

    [RNAirshipBridgeShared() liveActivityStartWithOptions:request
                                           completionHandler:^(id result, NSError * _Nullable error) {
        [self handleResult:result error:error resolve:resolve reject:reject];
    }];
}

RCT_REMAP_METHOD(liveActivityUpdate,
                 liveActivityUpdate:(NSDictionary *)request
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {

    [RNAirshipBridgeShared() liveActivityUpdateWithOptions:request
                                           completionHandler:^(NSError * _Nullable error) {
        [self handleResult:nil error:error resolve:resolve reject:reject];
    }];
}

RCT_REMAP_METHOD(liveActivityEnd,
                 liveActivityEnd:(NSDictionary *)request
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {

    [RNAirshipBridgeShared() liveActivityEndWithOptions:request
                                        completionHandler:^(NSError * _Nullable error) {
        [self handleResult:nil error:error resolve:resolve reject:reject];
    }];
}

RCT_REMAP_METHOD(liveUpdateListAll,
                 liveUpdateListAll:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    reject(@"AIRSHIP_ERROR", @"Not supported on iOS", nil);
}

RCT_REMAP_METHOD(liveUpdateList,
                 liveUpdateList:(NSDictionary *)request
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {

    reject(@"AIRSHIP_ERROR", @"Not supported on iOS", nil);
}



RCT_REMAP_METHOD(liveUpdateStart,
                 liveUpdateStart:(NSDictionary *)request
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {

    reject(@"AIRSHIP_ERROR", @"Not supported on iOS", nil);
}

RCT_REMAP_METHOD(liveUpdateUpdate,
                 liveUpdateUpdate:(NSDictionary *)request
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {

    reject(@"AIRSHIP_ERROR", @"Not supported on iOS", nil);
}

RCT_REMAP_METHOD(liveUpdateEnd,
                 liveUpdateEnd:(NSDictionary *)request
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {

    reject(@"AIRSHIP_ERROR", @"Not supported on iOS", nil);
}

RCT_REMAP_METHOD(liveUpdateClearAll,
                 liveUpdateClearAll:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    reject(@"AIRSHIP_ERROR", @"Not supported on iOS", nil);
}


-(void)handleResult:(id)result
              error:(NSError *)error
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject {

    if (error) {
        reject(@"AIRSHIP_ERROR", error.localizedDescription, error);
    } else {
        resolve(result);
    }
}

@end

/* Copyright Airship and Contributors */

#import "RNAirship.h"

#if __has_include(<react_native_airship/react_native_airship-Swift.h>)
#import <react_native_airship/react_native_airship-Swift.h>
#else
#import "react_native_airship-Swift.h"
#endif

@implementation RNAirship
RCT_EXPORT_MODULE()

- (NSArray<NSString *> *)supportedEvents {
    return @[
        AirshipReactNative.pendingEventsEventName,
        AirshipReactNative.overridePresentationOptionsEventName,
        AirshipReactNative.pendingEmbeddedUpdated
    ];
}

-(void)startObserving {
    __weak RNAirship *weakSelf = self;
    
    [AirshipReactNative.shared setNotifier:^(NSString *name, NSDictionary<NSString *,id> *body) {
        [weakSelf sendEventWithName:name body:body];
    }];
}

-(void)stopObserving {
    [AirshipReactNative.shared setNotifier:nil];
}

- (void)setBridge:(RCTBridge *)bridge {
    self.reactBridge = bridge;

    [AirshipReactNative.shared attemptTakeOffWithLaunchOptions:self.bridge.launchOptions];
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
    [AirshipReactNative.shared onListenerAddedWithEventName:eventName];
}

RCT_REMAP_METHOD(takePendingEvents,
                 takePendingEvents:(NSString *)eventName
                 isHeadlessJS:(BOOL)isHeadlessJS
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    // isHeadlessJS is always false for iOS. It's an Android only flag.
    [AirshipReactNative.shared takePendingEventsWithEventName:eventName completionHandler:^(NSArray *result) {
        resolve(result);
    }];
}

RCT_REMAP_METHOD(takeOff,
                 takeOff:(NSDictionary *)config
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    id result = [AirshipReactNative.shared takeOffWithJson:config
                                             launchOptions:nil
                                                     error:&error];
    
    [self handleResult:result error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(isFlying,
                 isFlying:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    resolve(@([AirshipReactNative.shared isFlying]));
}

RCT_REMAP_METHOD(channelAddTag,
                 channelAddTag:(NSString *)tag
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [AirshipReactNative.shared channelAddTag:tag error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(channelRemoveTag,
                 channelRemoveTag:(NSString *)tag
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [AirshipReactNative.shared channelRemoveTag:tag error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(channelEditTags,
                 channelEditTags:(NSArray *)operations
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [AirshipReactNative.shared channelEditTagsWithJson:operations
                                                      error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(channelEnableChannelCreation,
                 channelEnableChannelCreation:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [AirshipReactNative.shared channelEnableChannelCreationAndReturnError:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(pushGetActiveNotifications,
                 pushGetActiveNotifications:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    [AirshipReactNative.shared pushGetActiveNotificationsWithCompletionHandler:^(NSArray<NSDictionary<NSString *,id> *> *result, NSError *error) {
        [self handleResult:result error:error resolve:resolve reject:reject];
    }];
}

RCT_EXPORT_METHOD(pushClearNotifications) {
    [AirshipReactNative.shared pushClearNotifications];
}

RCT_EXPORT_METHOD(pushClearNotification:(NSString *)identifier) {
    [AirshipReactNative.shared pushClearNotification:identifier];
}

RCT_REMAP_METHOD(pushGetNotificationStatus,
                 pushGetNotificationStatus:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {

    [AirshipReactNative.shared pushGetNotificationStatusWithCompletionHandler:^(id result, NSError *error) {
        [self handleResult:result error:error resolve:resolve reject:reject];
    }];
}

RCT_REMAP_METHOD(pushGetRegistrationToken,
                 pushGetRegistrationToken:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    NSString *result = [AirshipReactNative.shared pushGetRegistrationTokenOrEmptyAndReturnError:&error];

    [self handleResult:result.length ? result : nil
                 error:error
               resolve:resolve
                reject:reject];
}

RCT_REMAP_METHOD(pushIsUserNotificationsEnabled,
                 pushIsUserNotificationsEnabled:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    id result = [AirshipReactNative.shared  pushIsUserNotificationsEnabledAndReturnError:&error];

    [self handleResult:result error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(pushSetUserNotificationsEnabled,
                 pushSetUserNotificationsEnabled:(BOOL)enabled
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [AirshipReactNative.shared pushSetUserNotificationsEnabled:enabled
                                                         error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(pushEnableUserNotifications,
                 pushEnableUserNotifications:(NSDictionary *)options
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    [AirshipReactNative.shared pushEnableUserNotificationsWithOptions:options completionHandler:^(BOOL result, NSError *error) {
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
    id result = [AirshipReactNative.shared  pushGetBadgeNumberAndReturnError:&error];

    [self handleResult:result error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(pushIosIsAutobadgeEnabled,
                 pushIosIsAutobadgeEnabled:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    id result = [AirshipReactNative.shared  pushIsAutobadgeEnabledAndReturnError:&error];

    [self handleResult:result error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(pushIosSetAutobadgeEnabled,
                 pushIosSetAutobadgeEnabled:(BOOL)enabled
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [AirshipReactNative.shared pushSetAutobadgeEnabled:enabled
                                                 error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(pushIosSetBadgeNumber,
                 pushIosSetBadgeNumber:(double)badgeNumber
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    [AirshipReactNative.shared pushSetBadgeNumber:badgeNumber completionHandler:^(NSError *error) {
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
    [AirshipReactNative.shared pushSetForegroundPresentationOptionsWithNames:options
                                                                       error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(pushIosSetNotificationOptions,
                 pushIosSetNotificationOptions:(NSArray *)options
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [AirshipReactNative.shared pushSetNotificationOptionsWithNames:options
                                                             error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(channelEditAttributes,
                 channelEditAttributes:(NSArray *)operations
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [AirshipReactNative.shared channelEditAttributesWithJson:operations
                                                       error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(channelEditSubscriptionLists,
                 channelEditSubscriptionLists:(NSArray *)operations
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [AirshipReactNative.shared channelEditSubscriptionListsWithJson:operations
                                                              error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(channelEditTagGroups,
                 channelEditTagGroups:(NSArray *)operations
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [AirshipReactNative.shared channelEditTagGroupsWithJson:operations
                                                      error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}


RCT_REMAP_METHOD(channelGetChannelId,
                 channelGetChannelId:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    NSString *result = [AirshipReactNative.shared  channelGetChannelIdOrEmptyAndReturnError:&error];

    [self handleResult:result.length ? result : nil
                 error:error
               resolve:resolve
                reject:reject];
}


RCT_REMAP_METHOD(channelGetSubscriptionLists,
                 channelGetSubscriptionLists:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [AirshipReactNative.shared channelGetSubscriptionListsWithCompletionHandler:^(NSArray<NSString *> *result, NSError *error) {

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
    id result = [AirshipReactNative.shared channelGetTagsAndReturnError:&error];

    [self handleResult:result error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(actionRun,
                 actionRun:(NSDictionary *)action
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    [AirshipReactNative.shared actionsRunWithAction:action
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
    [AirshipReactNative.shared analyticsAssociateIdentifier:identifier
                                                        key:key
                                                      error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(analyticsTrackScreen,
                 analyticsTrackScreen:(NSString *)screen
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [AirshipReactNative.shared analyticsTrackScreen:screen
                                              error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(addCustomEvent,
                 addCustomEvent:(NSDictionary *)event
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [AirshipReactNative.shared addCustomEvent:event
                                        error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(analyticsGetSessionId,
                 analyticsGetSessionId:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    NSString *result = [AirshipReactNative.shared analyticsGetSessionIdAndReturnError:&error];

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
    [AirshipReactNative.shared contactEditAttributesWithJson:operations
                                                       error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(contactEditSubscriptionLists,
                 contactEditSubscriptionLists:(NSArray *)operations
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [AirshipReactNative.shared contactEditSubscriptionListsWithJson:operations
                                                              error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(contactEditTagGroups,
                 contactEditTagGroups:(NSArray *)operations
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [AirshipReactNative.shared contactEditTagGroupsWithJson:operations
                                                      error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(contactGetSubscriptionLists,
                 contactGetSubscriptionLists:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    [AirshipReactNative.shared contactGetSubscriptionListsWithCompletionHandler:^(NSDictionary *result, NSError *error) {

        [self handleResult:result
                     error:error
                   resolve:resolve
                    reject:reject];
    }];
}

RCT_REMAP_METHOD(contactGetNamedUserId,
                 contactGetNamedUserId:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {

    [AirshipReactNative.shared contactGetNamedUserIdOrEmtpyWithCompletionHandler:^(NSString *result, NSError *error) {
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
    [AirshipReactNative.shared contactIdentify:namedUser
                                         error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(contactReset,
                 contactReset:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [AirshipReactNative.shared contactResetAndReturnError:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(contactNotifyRemoteLogin,
                 contactNotifyRemoteLogin:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [AirshipReactNative.shared contactNotifyRemoteLoginAndReturnError:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(inAppGetDisplayInterval,
                 inAppGetDisplayInterval:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    id result = [AirshipReactNative.shared inAppGetDisplayIntervalAndReturnError:&error];

    [self handleResult:result error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(inAppIsPaused,
                 inAppIsPaused:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    id result = [AirshipReactNative.shared inAppIsPausedAndReturnError:&error];
    
    [self handleResult:result error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(inAppSetDisplayInterval,
                 inAppSetDisplayInterval:(double)milliseconds
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [AirshipReactNative.shared inAppSetDisplayIntervalWithMilliseconds:milliseconds
                                                                 error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(inAppSetPaused,
                 inAppSetPaused:(BOOL)paused
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [AirshipReactNative.shared inAppSetPaused:paused
                                        error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(inAppResendPendingEmbeddedEvent) {
    [AirshipReactNative.shared inAppResendPendingEmbeddedEvent];
}

RCT_REMAP_METHOD(localeClearLocaleOverride,
                 localeClearLocaleOverride:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [AirshipReactNative.shared localeClearLocaleOverrideAndReturnError:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(localeGetLocale,
                 localeGetLocale:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    id result = [AirshipReactNative.shared localeGetLocaleAndReturnError:&error];

    
    [self handleResult:result error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(localeSetLocaleOverride,
                 localeSetLocaleOverride:(NSString *)localeIdentifier
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [AirshipReactNative.shared localeSetLocaleOverrideWithLocaleIdentifier:localeIdentifier
                                                                     error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(messageCenterDeleteMessage,
                 messageCenterDeleteMessage:(NSString *)messageId
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    [AirshipReactNative.shared messageCenterDeleteMessageWithMessageId:messageId
                                                     completionHandler:^(NSError * error) {
        [self handleResult:nil error:error resolve:resolve reject:reject];
    }];
}

RCT_REMAP_METHOD(messageCenterDismiss,
                 messageCenterDismiss:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {

    NSError *error;
    [AirshipReactNative.shared messageCenterDismissAndReturnError:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(messageCenterDisplay,
                 messageCenterDisplay:(NSString *)messageId
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [AirshipReactNative.shared messageCenterDisplayWithMessageId:messageId
                                                           error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(messageCenterShowMessageCenter,
                 messageCenterShowMessageCenter:(NSString *)messageId
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [AirshipReactNative.shared messageCenterShowMessageCenterWithMessageId:messageId
                                                           error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(messageCenterShowMessageView,
                 messageCenterShowMessageView:(NSString *)messageId
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [AirshipReactNative.shared messageCenterShowMessageViewWithMessageId:messageId
                                                           error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(messageCenterGetMessages,
                 messageCenterGetMessages:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {

    [AirshipReactNative.shared messageCenterGetMessagesWithCompletionHandler:^(NSArray *result, NSError *error) {
        [self handleResult:result error:error resolve:resolve reject:reject];
    }];
}

RCT_REMAP_METHOD(messageCenterGetUnreadCount,
                 messageCenterGetUnreadCount:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {

    [AirshipReactNative.shared messageCenterGetUnreadCountWithCompletionHandler:^(double result, NSError *error) {
        [self handleResult:@(result) error:error resolve:resolve reject:reject];
    }];
}

RCT_REMAP_METHOD(messageCenterMarkMessageRead,
                 messageCenterMarkMessageRead:(NSString *)messageId
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    [AirshipReactNative.shared messageCenterMarkMessageReadWithMessageId:messageId
                                                       completionHandler:^(NSError * error) {
        [self handleResult:nil error:error resolve:resolve reject:reject];
    }];
}

RCT_REMAP_METHOD(messageCenterRefresh,
                 messageCenterRefresh:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    [AirshipReactNative.shared messageCenterRefreshWithCompletionHandler:^(NSError *error) {
        [self handleResult:nil error:error resolve:resolve reject:reject];
    }];
}

RCT_EXPORT_METHOD(messageCenterSetAutoLaunchDefaultMessageCenter:(BOOL)enabled) {
    [AirshipReactNative.shared messageCenterSetAutoLaunchDefaultMessageCenterWithAutoLaunch:enabled];
}

RCT_EXPORT_METHOD(preferenceCenterAutoLaunchDefaultPreferenceCenter:(NSString *)preferenceCenterId
                  autoLaunch:(BOOL)autoLaunch) {
    [AirshipReactNative.shared preferenceCenterAutoLaunchDefaultPreferenceCenterWithPreferenceCenterId:preferenceCenterId
                                                                                            autoLaunch:autoLaunch];
}

RCT_REMAP_METHOD(preferenceCenterDisplay,
                 preferenceCenterDisplay:(NSString *)preferenceCenterId
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {

    NSError *error;
    [AirshipReactNative.shared preferenceCenterDisplayWithPreferenceCenterId:preferenceCenterId
                                                                       error:&error];
    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(preferenceCenterGetConfig,
                 preferenceCenterGetConfig:(NSString *)preferenceCenterId
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {

    [AirshipReactNative.shared preferenceCenterGetConfigWithPreferenceCenterId:preferenceCenterId
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
    [AirshipReactNative.shared privacyManagerDisableFeatureWithFeatures:features error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(privacyManagerEnableFeature,
                 privacyManagerEnableFeature:(NSArray *)features
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [AirshipReactNative.shared privacyManagerEnableFeatureWithFeatures:features error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(privacyManagerGetEnabledFeatures,
                 privacyManagerGetEnabledFeatures:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    id result = [AirshipReactNative.shared privacyManagerGetEnabledFeaturesAndReturnError:&error];

    [self handleResult:result error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(privacyManagerIsFeatureEnabled,
                 privacyManagerIsFeatureEnabled:(NSArray *)features
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    id result = [AirshipReactNative.shared privacyManagerIsFeatureEnabledWithFeatures:features
                                                                                error:&error];

    [self handleResult:result error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(privacyManagerSetEnabledFeatures,
                 privacyManagerSetEnabledFeatures:(NSArray *)features
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    [AirshipReactNative.shared privacyManagerSetEnabledFeaturesWithFeatures:features error:&error];

    [self handleResult:nil error:error resolve:resolve reject:reject];
}


RCT_EXPORT_METHOD(pushIosIsOverridePresentationOptionsEnabled:(BOOL)enabled) {
    AirshipReactNative.shared.overridePresentationOptionsEnabled = enabled;
}

RCT_EXPORT_METHOD(pushIosOverridePresentationOptions:(NSString *)requestID options:(NSArray *)presentationOptions) {
    [AirshipReactNative.shared presentationOptionOverridesResultWithRequestID:requestID presentationOptions:presentationOptions];
}

RCT_REMAP_METHOD(pushIosGetAuthorizedNotificationSettings,
                 pushIosGetAuthorizedNotificationSettings:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    id result = [AirshipReactNative.shared pushGetAuthorizedNotificationSettingsAndReturnError:&error];
    [self handleResult:result error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(pushIosGetAuthorizedNotificationStatus,
                 pushIosGetAuthorizedNotificationStatus:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {
    NSError *error;
    id result = [AirshipReactNative.shared pushGetAuthorizedNotificationStatusAndReturnError:&error];
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
    [AirshipReactNative.shared featureFlagManagerTrackInteractedWithFlag:flag error:&error];
    [self handleResult:nil error:error resolve:resolve reject:reject];
}

RCT_REMAP_METHOD(featureFlagManagerFlag,
                 featureFlagManagerFlag:(NSString *)flagName
                 useResultCache:(BOOL)useResultCache
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {

    [AirshipReactNative.shared featureFlagManagerFlagWithFlagName:flagName
                                                   useResultCache:useResultCache
                                                completionHandler:^(id result, NSError * _Nullable error) {
        [self handleResult:result error:error resolve:resolve reject:reject];
    }];
}

RCT_REMAP_METHOD(featureFlagManagerResultCacheGetFlag,
                 featureFlagManagerResultCacheGetFlag:(NSString *)flagName
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {

    [AirshipReactNative.shared featureFlagManagerResultCacheGetFlagWithName:flagName
                                                completionHandler:^(id result, NSError * _Nullable error) {
        [self handleResult:result error:error resolve:resolve reject:reject];
    }];
}

RCT_REMAP_METHOD(featureFlagManagerResultCacheSetFlag,
                 featureFlagManagerResultCacheSetFlag:(NSDictionary *)flag
                 ttl:(double)ttl
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {

    [AirshipReactNative.shared featureFlagManagerResultCacheSetFlagWithFlag:flag
                                                                ttl:@(ttl)
                                                          completionHandler:^(NSError * _Nullable error) {
                  [self handleResult:nil error:error resolve:resolve reject:reject];
              }];
}

RCT_REMAP_METHOD(featureFlagManagerResultCacheRemoveFlag,
                 featureFlagManagerResultCacheRemoveFlag:(NSString *)flagName
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {

    [AirshipReactNative.shared featureFlagManagerResultCacheRemoveFlagWithName:flagName
                                                     completionHandler:^(NSError * _Nullable error) {
        [self handleResult:nil error:error resolve:resolve reject:reject];
    }];
}


RCT_REMAP_METHOD(liveActivityListAll,
                 liveActivityListAll:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {

    [AirshipReactNative.shared liveActivityListAllWithCompletionHandler:^(id result, NSError * _Nullable error) {
        [self handleResult:result error:error resolve:resolve reject:reject];
    }];
}

RCT_REMAP_METHOD(liveActivityList,
                 liveActivityListRequest:(NSDictionary *)request
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {

    [AirshipReactNative.shared liveActivityListWithOptions:request
                                                completionHandler:^(id result, NSError * _Nullable error) {
        [self handleResult:result error:error resolve:resolve reject:reject];
    }];
}

RCT_REMAP_METHOD(liveActivityStart,
                 liveActivityStart:(NSDictionary *)request
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {

    [AirshipReactNative.shared liveActivityStartWithOptions:request
                                           completionHandler:^(id result, NSError * _Nullable error) {
        [self handleResult:result error:error resolve:resolve reject:reject];
    }];
}

RCT_REMAP_METHOD(liveActivityUpdate,
                 liveActivityUpdate:(NSDictionary *)request
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {

    [AirshipReactNative.shared liveActivityUpdateWithOptions:request
                                           completionHandler:^(NSError * _Nullable error) {
        [self handleResult:nil error:error resolve:resolve reject:reject];
    }];
}

RCT_REMAP_METHOD(liveActivityEnd,
                 liveActivityEnd:(NSDictionary *)request
                 resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject) {

    [AirshipReactNative.shared liveActivityEndWithOptions:request
                                        completionHandler:^(NSError * _Nullable error) {
        [self handleResult:nil error:error resolve:resolve reject:reject];
    }];
}

RCT_REMAP_METHOD(liveUpdateListAll,
                 liveUpdateListAll:(NSDictionary *)request
                 resolve:(RCTPromiseResolveBlock)resolve
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

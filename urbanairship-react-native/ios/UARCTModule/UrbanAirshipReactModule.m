/* Copyright Urban Airship and Contributors */

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(UrbanAirshipReactModule, NSObject)

RCT_EXTERN_METHOD(onAirshipListenerAdded:(NSString *)eventName)

RCT_EXTERN_METHOD(addListener:(NSString *)eventName)

RCT_EXTERN_METHOD(removeListeners(NSInteger *)count)

RCT_EXTERN_METHOD(takeOff:(NSDictionary *)config resolver:(RCTPromiseResolveBlock *)resolve
                  rejecter:(RCTPromiseRejectBlock *)reject)

RCT_EXTERN_METHOD(isFlying:(RCTPromiseResolveBlock *)resolve
                  rejecter:(RCTPromiseRejectBlock *)reject)

RCT_EXTERN_METHOD(takePendingEvents:(NSString *)type resolver:(RCTPromiseResolveBlock *)resolve
                  rejecter:(RCTPromiseRejectBlock *)reject)

RCT_EXTERN_METHOD(setUserNotificationsEnabled:(BOOL *))

RCT_EXTERN_METHOD(enableChannelCreation)

RCT_EXTERN_METHOD(setEnabledFeatures:(NSArray *)features resolver:(RCTPromiseResolveBlock *)resolve
                                      rejecter:(RCTPromiseRejectBlock *)reject)

RCT_EXTERN_METHOD(getEnabledFeatures:(RCTPromiseResolveBlock *)resolve rejecter:(RCTPromiseRejectBlock *)reject)

RCT_EXTERN_METHOD(enableFeature:(NSArray *)features resolver:(RCTPromiseResolveBlock *)resolve
                                      rejecter:(RCTPromiseRejectBlock *)reject)

RCT_EXTERN_METHOD(disableFeature:(NSArray *)features resolver:(RCTPromiseResolveBlock *)resolve
                                      rejecter:(RCTPromiseRejectBlock *)reject)

RCT_EXTERN_METHOD(isFeatureEnabled:(NSArray *)features resolver:(RCTPromiseResolveBlock *)resolve
                                      rejecter:(RCTPromiseRejectBlock *)reject)

RCT_EXTERN_METHOD(isUserNotificationsEnabled:(RCTPromiseResolveBlock *)resolve rejecter:(RCTPromiseRejectBlock *)reject)

RCT_EXTERN_METHOD(isUserNotificationsOptedIn:(RCTPromiseResolveBlock *)resolve rejecter:(RCTPromiseRejectBlock *)reject)

RCT_EXTERN_METHOD(isSystemNotificationsEnabledForApp:(RCTPromiseResolveBlock *)resolve rejecter:(RCTPromiseRejectBlock *)reject)

RCT_EXTERN_METHOD(setNamedUser:(NSString *))

RCT_EXTERN_METHOD(getNamedUser:(RCTPromiseResolveBlock *)resolve rejecter:(RCTPromiseRejectBlock *)reject)

RCT_EXTERN_METHOD(addTag:(NSString *))

RCT_EXTERN_METHOD(removeTag:(NSString *))

RCT_EXTERN_METHOD(getTags:(RCTPromiseResolveBlock *)resolve rejecter:(RCTPromiseRejectBlock *)reject)

RCT_EXTERN_METHOD(getSubscriptionLists:(NSArray *)subscriptionTypes resolver:(RCTPromiseResolveBlock *)resolve rejecter:(RCTPromiseRejectBlock *)reject)

RCT_EXTERN_METHOD(setAnalyticsEnabled:(BOOL *))

RCT_EXTERN_METHOD(isAnalyticsEnabled:(RCTPromiseResolveBlock *)resolve rejecter:(RCTPromiseRejectBlock *)reject)

RCT_EXTERN_METHOD(trackScreen:(NSString *))

RCT_EXTERN_METHOD(getChannelId:(RCTPromiseResolveBlock *)resolve rejecter:(RCTPromiseRejectBlock *)reject)

RCT_EXTERN_METHOD(getRegistrationToken:(RCTPromiseResolveBlock *)resolve rejecter:(RCTPromiseRejectBlock *)reject)

RCT_EXTERN_METHOD(associateIdentifier:(NSString *)key identifier:(NSString *))

RCT_EXTERN_METHOD(runAction:(NSString *)name actionValue:(id *)value resolver:(RCTPromiseResolveBlock *)resolve rejecter:(RCTPromiseRejectBlock *)reject)

RCT_EXTERN_METHOD(editContactTagGroups:(NSArray *)operations)

RCT_EXTERN_METHOD(editChannelTagGroups:(NSArray *)operations)

RCT_EXTERN_METHOD(editContactAttributes:(NSArray *)operations)

RCT_EXTERN_METHOD(editChannelAttributes:(NSArray *)operations)

RCT_EXTERN_METHOD(editContactSubscriptionLists:(NSArray *)subscriptionListUpdates)

RCT_EXTERN_METHOD(editChannelSubscriptionLists:(NSArray *)subscriptionListUpdates)

RCT_EXTERN_METHOD(setNotificationOptions:(NSArray *)options
                  resolver:(RCTPromiseResolveBlock *)resolve
                  rejecter:(RCTPromiseRejectBlock *)reject)

RCT_EXTERN_METHOD(setForegroundPresentationOptions:(NSArray *)options
                  resolver:(RCTPromiseResolveBlock *)resolve
                  rejecter:(RCTPromiseRejectBlock *)reject)

RCT_EXTERN_METHOD(getNotificationStatus:(RCTPromiseResolveBlock *)resolve rejecter:(RCTPromiseRejectBlock *)reject)

RCT_EXTERN_METHOD(setAutobadgeEnabled:(BOOL *))

RCT_EXTERN_METHOD(isAutobadgeEnabled:(RCTPromiseResolveBlock *)resolve rejecter:(RCTPromiseRejectBlock *)reject)

RCT_EXTERN_METHOD(setBadgeNumber:(NSInteger *)badgeNumber)

RCT_EXTERN_METHOD(getBadgeNumber:(RCTPromiseResolveBlock *)resolve rejecter:(RCTPromiseRejectBlock *)reject)

RCT_EXTERN_METHOD(displayMessageCenter)

RCT_EXTERN_METHOD(dismissMessageCenter)

RCT_EXTERN_METHOD(displayMessage:(NSString *)messageId resolver:(RCTPromiseResolveBlock *)resolve rejecter:(RCTPromiseRejectBlock *)reject)

RCT_EXTERN_METHOD(dismissMessage:(RCTPromiseResolveBlock *)resolve rejecter:(RCTPromiseRejectBlock *)reject)

RCT_EXTERN_METHOD(getInboxMessages:(RCTPromiseResolveBlock *)resolve rejecter:(RCTPromiseRejectBlock *)reject)

RCT_EXTERN_METHOD(getUnreadMessageCount:(RCTPromiseResolveBlock *)resolve rejecter:(RCTPromiseRejectBlock *)reject)

RCT_EXTERN_METHOD(deleteInboxMessage:(NSString *)messageId resolver:(RCTPromiseResolveBlock *)resolve rejecter:(RCTPromiseRejectBlock *)reject)

RCT_EXTERN_METHOD(markInboxMessageRead:(NSString *)messageId resolver:(RCTPromiseResolveBlock *)resolve rejecter:(RCTPromiseRejectBlock *)reject)

RCT_EXTERN_METHOD(refreshInbox:(RCTPromiseResolveBlock *)resolve rejecter:(RCTPromiseRejectBlock *)reject)

RCT_EXTERN_METHOD(setAutoLaunchDefaultMessageCenter:(BOOL *)enabled)

RCT_EXTERN_METHOD(setCurrentLocale:(NSString *)localeIdentifier)

RCT_EXTERN_METHOD(getCurrentLocale:(RCTPromiseResolveBlock *)resolve rejecter:(RCTPromiseRejectBlock *)reject)

RCT_EXTERN_METHOD(clearLocale)

RCT_EXTERN_METHOD(clearNotifications)

RCT_EXTERN_METHOD(clearNotification:(NSString *)identifier)

RCT_EXTERN_METHOD(getActiveNotifications:(RCTPromiseResolveBlock *)resolve rejecter:(RCTPromiseRejectBlock *)reject)

RCT_EXTERN_METHOD(displayPreferenceCenter:(NSString *)preferenceCenterId)

RCT_EXTERN_METHOD(setUseCustomPreferenceCenterUi:(BOOL *)useCustomUi forPreferenceId:(NSString *)preferenceId)

RCT_EXTERN_METHOD(getPreferenceCenterConfig:(NSString *)preferenceCenterId resolver:(RCTPromiseResolveBlock *)resolve rejecter:(RCTPromiseRejectBlock)reject)


@end

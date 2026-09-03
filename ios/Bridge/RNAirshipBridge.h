/* Copyright Airship and Contributors */

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

/**
 * Objective-C interface to the Swift side of the module.
 *
 * The Objective-C++ React Native glue (TurboModule and Fabric views) cannot
 * import the Swift-generated header when built with Swift Package Manager, so
 * the Swift classes conform to these protocols and are resolved by name at
 * runtime. The Swift compiler enforces that every requirement is implemented.
 */
@protocol RNAirshipBridge <NSObject>

@property (nonatomic, class, readonly, copy) NSString * _Nonnull pendingEventsEventName;
@property (nonatomic, class, readonly, copy) NSString * _Nonnull overridePresentationOptionsEventName;
@property (nonatomic, class, readonly, copy) NSString * _Nonnull pendingEmbeddedUpdated;

@property (nonatomic) BOOL overridePresentationOptionsEnabled;
- (void)setNotifier:(void (^ _Nullable)(NSString * _Nonnull, NSDictionary<NSString *, id> * _Nonnull))notifier NS_SWIFT_NAME(setNotifier(_:));
- (void)presentationOptionOverridesResultWithRequestID:(NSString * _Nonnull)requestID presentationOptions:(NSArray<NSString *> * _Nullable)presentationOptions NS_SWIFT_NAME(presentationOptionOverridesResult(requestID:presentationOptions:));
- (void)onListenerAddedWithEventName:(NSString * _Nonnull)eventName NS_SWIFT_NAME(onListenerAdded(eventName:));
- (void)takePendingEventsWithEventName:(NSString * _Nonnull)eventName completionHandler:(void (^ _Nonnull)(NSArray * _Nonnull))completionHandler NS_SWIFT_NAME(takePendingEvents(eventName:)) NS_SWIFT_ASYNC_NAME(takePendingEvents(eventName:));
- (void)attemptTakeOff NS_SWIFT_NAME(attemptTakeOff());
- (void)actionsRunWithAction:(NSDictionary<NSString *, id> * _Nonnull)action completionHandler:(void (^ _Nonnull)(id _Nullable_result, NSError * _Nullable))completionHandler NS_SWIFT_NAME(actionsRun(action:)) NS_SWIFT_ASYNC_NAME(actionsRun(action:));
- (BOOL)localeSetLocaleOverrideWithLocaleIdentifier:(NSString * _Nullable)localeIdentifier error:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(localeSetLocaleOverride(localeIdentifier:));
- (BOOL)localeClearLocaleOverrideAndReturnError:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(localeClearLocaleOverride());
- (NSString * _Nullable)localeGetLocaleAndReturnError:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(localeGetLocale());
- (BOOL)preferenceCenterDisplayWithPreferenceCenterId:(NSString * _Nonnull)preferenceCenterId error:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(preferenceCenterDisplay(preferenceCenterId:));
- (void)preferenceCenterGetConfigWithPreferenceCenterId:(NSString * _Nonnull)preferenceCenterId completionHandler:(void (^ _Nonnull)(id _Nullable_result, NSError * _Nullable))completionHandler NS_SWIFT_NAME(preferenceCenterGetConfig(preferenceCenterId:)) NS_SWIFT_ASYNC_NAME(preferenceCenterGetConfig(preferenceCenterId:));
- (void)preferenceCenterAutoLaunchDefaultPreferenceCenterWithPreferenceCenterId:(NSString * _Nonnull)preferenceCenterId autoLaunch:(BOOL)autoLaunch NS_SWIFT_NAME(preferenceCenterAutoLaunchDefaultPreferenceCenter(preferenceCenterId:autoLaunch:));
- (NSNumber * _Nullable)takeOffWithJson:(id _Nonnull)json error:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(takeOff(json:));
- (BOOL)isFlying NS_SWIFT_NAME(isFlying());
- (void)getLaunchDeepLinkWithCompletionHandler:(void (^ _Nonnull)(NSString * _Nullable))completionHandler NS_SWIFT_NAME(getLaunchDeepLink()) NS_SWIFT_ASYNC_NAME(getLaunchDeepLink());
- (BOOL)analyticsTrackScreen:(NSString * _Nullable)screen error:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(analyticsTrackScreen(_:));
- (BOOL)analyticsAssociateIdentifier:(NSString * _Nullable)identifier key:(NSString * _Nonnull)key error:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(analyticsAssociateIdentifier(_:key:));
- (BOOL)addCustomEvent:(id _Nonnull)json error:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(addCustomEvent(_:));
- (NSString * _Nullable)analyticsGetSessionIdAndReturnError:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(analyticsGetSessionId());
- (void)featureFlagManagerFlagWithFlagName:(NSString * _Nonnull)flagName useResultCache:(BOOL)useResultCache completionHandler:(void (^ _Nonnull)(id _Nullable, NSError * _Nullable))completionHandler NS_SWIFT_NAME(featureFlagManagerFlag(flagName:useResultCache:)) NS_SWIFT_ASYNC_NAME(featureFlagManagerFlag(flagName:useResultCache:));
- (BOOL)featureFlagManagerTrackInteractedWithFlag:(id _Nonnull)flag error:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(featureFlagManagerTrackInteracted(flag:));
- (void)featureFlagManagerResultCacheGetFlagWithName:(NSString * _Nonnull)name completionHandler:(void (^ _Nonnull)(id _Nullable, NSError * _Nullable))completionHandler NS_SWIFT_NAME(featureFlagManagerResultCacheGetFlag(name:)) NS_SWIFT_ASYNC_NAME(featureFlagManagerResultCacheGetFlag(name:));
- (void)featureFlagManagerResultCacheSetFlagWithFlag:(id _Nonnull)flag ttl:(NSNumber * _Nonnull)ttl completionHandler:(void (^ _Nonnull)(NSError * _Nullable))completionHandler NS_SWIFT_NAME(featureFlagManagerResultCacheSetFlag(flag:ttl:)) NS_SWIFT_ASYNC_NAME(featureFlagManagerResultCacheSetFlag(flag:ttl:));
- (void)featureFlagManagerResultCacheRemoveFlagWithName:(NSString * _Nonnull)name completionHandler:(void (^ _Nonnull)(NSError * _Nullable))completionHandler NS_SWIFT_NAME(featureFlagManagerResultCacheRemoveFlag(name:)) NS_SWIFT_ASYNC_NAME(featureFlagManagerResultCacheRemoveFlag(name:));
- (NSNumber * _Nullable)inAppIsPausedAndReturnError:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(inAppIsPaused());
- (BOOL)inAppSetPaused:(BOOL)paused error:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(inAppSetPaused(_:));
- (BOOL)inAppSetDisplayIntervalWithMilliseconds:(double)milliseconds error:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(inAppSetDisplayInterval(milliseconds:));
- (NSNumber * _Nullable)inAppGetDisplayIntervalAndReturnError:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(inAppGetDisplayInterval());
- (void)inAppResendPendingEmbeddedEvent NS_SWIFT_NAME(inAppResendPendingEmbeddedEvent());
- (void)liveActivityListWithOptions:(id _Nonnull)options completionHandler:(void (^ _Nonnull)(id _Nullable, NSError * _Nullable))completionHandler NS_SWIFT_NAME(liveActivityList(options:)) NS_SWIFT_ASYNC_NAME(liveActivityList(options:));
- (void)liveActivityListAllWithCompletionHandler:(void (^ _Nonnull)(id _Nullable, NSError * _Nullable))completionHandler NS_SWIFT_NAME(liveActivityListAll()) NS_SWIFT_ASYNC_NAME(liveActivityListAll());
- (void)liveActivityStartWithOptions:(id _Nonnull)options completionHandler:(void (^ _Nonnull)(id _Nullable, NSError * _Nullable))completionHandler NS_SWIFT_NAME(liveActivityStart(options:)) NS_SWIFT_ASYNC_NAME(liveActivityStart(options:));
- (void)liveActivityUpdateWithOptions:(id _Nonnull)options completionHandler:(void (^ _Nonnull)(NSError * _Nullable))completionHandler NS_SWIFT_NAME(liveActivityUpdate(options:)) NS_SWIFT_ASYNC_NAME(liveActivityUpdate(options:));
- (void)liveActivityEndWithOptions:(id _Nonnull)options completionHandler:(void (^ _Nonnull)(NSError * _Nullable))completionHandler NS_SWIFT_NAME(liveActivityEnd(options:)) NS_SWIFT_ASYNC_NAME(liveActivityEnd(options:));
- (BOOL)privacyManagerSetEnabledFeaturesWithFeatures:(NSArray<NSString *> * _Nonnull)features error:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(privacyManagerSetEnabledFeatures(features:));
- (NSArray<NSString *> * _Nullable)privacyManagerGetEnabledFeaturesAndReturnError:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(privacyManagerGetEnabledFeatures());
- (BOOL)privacyManagerEnableFeatureWithFeatures:(NSArray<NSString *> * _Nonnull)features error:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(privacyManagerEnableFeature(features:));
- (BOOL)privacyManagerDisableFeatureWithFeatures:(NSArray<NSString *> * _Nonnull)features error:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(privacyManagerDisableFeature(features:));
- (NSNumber * _Nullable)privacyManagerIsFeatureEnabledWithFeatures:(NSArray<NSString *> * _Nonnull)features error:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(privacyManagerIsFeatureEnabled(features:));
- (BOOL)contactIdentify:(NSString * _Nullable)namedUser error:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(contactIdentify(_:));
- (BOOL)contactResetAndReturnError:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(contactReset());
- (BOOL)contactRegisterSms:(NSString * _Nonnull)msisdn options:(id _Nonnull)options error:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(contactRegisterSms(_:options:));
- (BOOL)contactRegisterEmail:(NSString * _Nonnull)address options:(id _Nonnull)options error:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(contactRegisterEmail(_:options:));
- (BOOL)contactNotifyRemoteLoginAndReturnError:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(contactNotifyRemoteLogin());
- (void)contactGetNamedUserIdOrEmtpyWithCompletionHandler:(void (^ _Nonnull)(NSString * _Nullable, NSError * _Nullable))completionHandler NS_SWIFT_NAME(contactGetNamedUserIdOrEmtpy()) NS_SWIFT_ASYNC_NAME(contactGetNamedUserIdOrEmtpy());
- (void)contactGetSubscriptionListsWithCompletionHandler:(void (^ _Nonnull)(NSDictionary<NSString *, NSArray<NSString *> *> * _Nullable, NSError * _Nullable))completionHandler NS_SWIFT_NAME(contactGetSubscriptionLists()) NS_SWIFT_ASYNC_NAME(contactGetSubscriptionLists());
- (BOOL)contactEditTagGroupsWithJson:(id _Nonnull)json error:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(contactEditTagGroups(json:));
- (BOOL)contactEditAttributesWithJson:(id _Nonnull)json error:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(contactEditAttributes(json:));
- (BOOL)contactEditSubscriptionListsWithJson:(id _Nonnull)json error:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(contactEditSubscriptionLists(json:));
- (void)messageCenterGetUnreadCountWithCompletionHandler:(void (^ _Nonnull)(double, NSError * _Nullable))completionHandler NS_SWIFT_NAME(messageCenterGetUnreadCount()) NS_SWIFT_ASYNC_NAME(messageCenterGetUnreadCount());
- (void)messageCenterGetMessagesWithCompletionHandler:(void (^ _Nonnull)(id _Nullable, NSError * _Nullable))completionHandler NS_SWIFT_NAME(messageCenterGetMessages()) NS_SWIFT_ASYNC_NAME(messageCenterGetMessages());
- (void)messageCenterMarkMessageReadWithMessageId:(NSString * _Nonnull)messageId completionHandler:(void (^ _Nonnull)(NSError * _Nullable))completionHandler NS_SWIFT_NAME(messageCenterMarkMessageRead(messageId:)) NS_SWIFT_ASYNC_NAME(messageCenterMarkMessageRead(messageId:));
- (void)messageCenterDeleteMessageWithMessageId:(NSString * _Nonnull)messageId completionHandler:(void (^ _Nonnull)(NSError * _Nullable))completionHandler NS_SWIFT_NAME(messageCenterDeleteMessage(messageId:)) NS_SWIFT_ASYNC_NAME(messageCenterDeleteMessage(messageId:));
- (BOOL)messageCenterDismissAndReturnError:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(messageCenterDismiss());
- (BOOL)messageCenterDisplayWithMessageId:(NSString * _Nullable)messageId error:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(messageCenterDisplay(messageId:));
- (BOOL)messageCenterShowMessageViewWithMessageId:(NSString * _Nonnull)messageId error:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(messageCenterShowMessageView(messageId:));
- (BOOL)messageCenterShowMessageCenterWithMessageId:(NSString * _Nullable)messageId error:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(messageCenterShowMessageCenter(messageId:));
- (void)messageCenterRefreshWithCompletionHandler:(void (^ _Nonnull)(NSError * _Nullable))completionHandler NS_SWIFT_NAME(messageCenterRefresh()) NS_SWIFT_ASYNC_NAME(messageCenterRefresh());
- (void)messageCenterSetAutoLaunchDefaultMessageCenterWithAutoLaunch:(BOOL)autoLaunch NS_SWIFT_NAME(messageCenterSetAutoLaunchDefaultMessageCenter(autoLaunch:));
- (BOOL)channelAddTag:(NSString * _Nonnull)tag error:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(channelAddTag(_:));
- (BOOL)channelRemoveTag:(NSString * _Nonnull)tag error:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(channelRemoveTag(_:));
- (BOOL)channelEditTagsWithJson:(id _Nonnull)json error:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(channelEditTags(json:));
- (BOOL)channelEnableChannelCreationAndReturnError:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(channelEnableChannelCreation());
- (NSArray<NSString *> * _Nullable)channelGetTagsAndReturnError:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(channelGetTags());
- (void)channelGetSubscriptionListsWithCompletionHandler:(void (^ _Nonnull)(NSArray<NSString *> * _Nullable, NSError * _Nullable))completionHandler NS_SWIFT_NAME(channelGetSubscriptionLists()) NS_SWIFT_ASYNC_NAME(channelGetSubscriptionLists());
- (NSString * _Nullable)channelGetChannelIdOrEmptyAndReturnError:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(channelGetChannelIdOrEmpty());
- (void)channelWaitForChannelIdWithCompletionHandler:(void (^ _Nonnull)(NSString * _Nullable, NSError * _Nullable))completionHandler NS_SWIFT_NAME(channelWaitForChannelId()) NS_SWIFT_ASYNC_NAME(channelWaitForChannelId());
- (BOOL)channelEditTagGroupsWithJson:(id _Nonnull)json error:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(channelEditTagGroups(json:));
- (BOOL)channelEditAttributesWithJson:(id _Nonnull)json error:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(channelEditAttributes(json:));
- (BOOL)channelEditSubscriptionListsWithJson:(id _Nonnull)json error:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(channelEditSubscriptionLists(json:));
- (BOOL)pushSetUserNotificationsEnabled:(BOOL)enabled error:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(pushSetUserNotificationsEnabled(_:));
- (NSNumber * _Nullable)pushIsUserNotificationsEnabledAndReturnError:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(pushIsUserNotificationsEnabled());
- (void)pushEnableUserNotificationsWithOptions:(id _Nullable)options completionHandler:(void (^ _Nonnull)(BOOL, NSError * _Nullable))completionHandler NS_SWIFT_NAME(pushEnableUserNotifications(options:)) NS_SWIFT_ASYNC_NAME(pushEnableUserNotifications(options:));
- (NSString * _Nullable)pushGetRegistrationTokenOrEmptyAndReturnError:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(pushGetRegistrationTokenOrEmpty());
- (BOOL)pushSetNotificationOptionsWithNames:(NSArray<NSString *> * _Nonnull)names error:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(pushSetNotificationOptions(names:));
- (BOOL)pushSetForegroundPresentationOptionsWithNames:(NSArray<NSString *> * _Nonnull)names error:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(pushSetForegroundPresentationOptions(names:));
- (void)pushGetNotificationStatusWithCompletionHandler:(void (^ _Nonnull)(NSDictionary<NSString *, id> * _Nullable, NSError * _Nullable))completionHandler NS_SWIFT_NAME(pushGetNotificationStatus()) NS_SWIFT_ASYNC_NAME(pushGetNotificationStatus());
- (BOOL)pushSetAutobadgeEnabled:(BOOL)enabled error:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(pushSetAutobadgeEnabled(_:));
- (NSNumber * _Nullable)pushIsAutobadgeEnabledAndReturnError:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(pushIsAutobadgeEnabled());
- (void)pushSetBadgeNumber:(double)badgeNumber completionHandler:(void (^ _Nonnull)(NSError * _Nullable))completionHandler NS_SWIFT_NAME(pushSetBadgeNumber(_:)) NS_SWIFT_ASYNC_NAME(pushSetBadgeNumber(_:));
- (NSNumber * _Nullable)pushGetBadgeNumberAndReturnError:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(pushGetBadgeNumber());
- (NSString * _Nullable)pushGetAuthorizedNotificationStatusAndReturnError:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(pushGetAuthorizedNotificationStatus());
- (NSArray<NSString *> * _Nullable)pushGetAuthorizedNotificationSettingsAndReturnError:(NSError * _Nullable * _Nullable)error NS_SWIFT_NAME(pushGetAuthorizedNotificationSettings());
- (void)pushClearNotifications NS_SWIFT_NAME(pushClearNotifications());
- (void)pushClearNotification:(NSString * _Nonnull)identifier NS_SWIFT_NAME(pushClearNotification(_:));
- (void)pushGetActiveNotificationsWithCompletionHandler:(void (^ _Nonnull)(NSArray<NSDictionary<NSString *, id> *> * _Nullable, NSError * _Nullable))completionHandler NS_SWIFT_NAME(pushGetActiveNotifications()) NS_SWIFT_ASYNC_NAME(pushGetActiveNotifications());

@end

NS_SWIFT_UI_ACTOR
@protocol RNAirshipMessageWebViewWrapperDelegate <NSObject>
- (void)onMessageBodyLoadFailedWithMessageID:(NSString *)messageID NS_SWIFT_NAME(onMessageBodyLoadFailed(messageID:));
- (void)onMessageGoneWithMessageID:(NSString *)messageID NS_SWIFT_NAME(onMessageGone(messageID:));
- (void)onMessageLoadFailedWithMessageID:(NSString *)messageID NS_SWIFT_NAME(onMessageLoadFailed(messageID:));
- (void)onLoadStartedWithMessageID:(NSString *)messageID NS_SWIFT_NAME(onLoadStarted(messageID:));
- (void)onLoadFinishedWithMessageID:(NSString *)messageID NS_SWIFT_NAME(onLoadFinished(messageID:));
- (void)onCloseWithMessageID:(NSString *)messageID NS_SWIFT_NAME(onClose(messageID:));
@end

NS_SWIFT_UI_ACTOR
@protocol RNAirshipMessageWebViewBridge <NSObject>
@property (nonatomic, weak, nullable) id<RNAirshipMessageWebViewWrapperDelegate> delegate;
- (void)loadMessageWithMessageID:(nullable NSString *)messageID NS_SWIFT_NAME(loadMessage(messageID:));
@end

NS_SWIFT_UI_ACTOR
@protocol RNAirshipEmbeddedViewBridge <NSObject>
- (void)setConfig:(nullable NSString *)json;
@end

/// The Swift `AirshipReactNative` class.
FOUNDATION_EXPORT Class<RNAirshipBridge> RNAirshipBridgeClass(void);

/// The shared `AirshipReactNative` instance.
FOUNDATION_EXPORT id<RNAirshipBridge> RNAirshipBridgeShared(void);

/// The Swift `RNAirshipMessageWebViewWrapper` view class.
FOUNDATION_EXPORT Class RNAirshipMessageWebViewBridgeClass(void);

/// The Swift `RNAirshipEmbeddedViewWrapper` view class.
FOUNDATION_EXPORT Class RNAirshipEmbeddedViewBridgeClass(void);

/// Disables automatic takeOff by the Swift `AirshipPluginLoader`.
FOUNDATION_EXPORT void RNAirshipBridgeDisablePluginLoader(void);

NS_ASSUME_NONNULL_END

/* Copyright Airship and Contributors */

'use strict';

import { NativeModules, Platform, EmitterSubscription } from "react-native";

import { CustomEvent } from "./CustomEvent";
import { TagGroupEditor, TagGroupOperation } from "./TagGroupEditor";
import { AttributeEditor, AttributeOperation } from "./AttributeEditor";
import { UAEventEmitter } from "./UAEventEmitter";
import { JsonObject, JsonValue } from "./Json";

/**
 * @hidden
 */
const UrbanAirshipModule = NativeModules.UrbanAirshipReactModule;

/**
 * @hidden
 */
const EventEmitter = new UAEventEmitter();

/**
 * Enum of internal event type names used by UAEventEmitter
 * @hidden
 */
enum InternalEventType {
  Registration = "com.urbanairship.registration",
  NotificationResponse = "com.urbanairship.notification_response",
  PushReceived = "com.urbanairship.push_received",
  DeepLink = "com.urbanairship.deep_link",
  InboxUpdated = "com.urbanairship.inbox_updated",
  NotificationOptInStatus = "com.urbanairship.notification_opt_in_status",
  ShowInbox = "com.urbanairship.show_inbox",
}

/**
 * Enum of event type names.
 */
export enum EventType {
  /**
   * Notification response event.
   */
  NotificationResponse = "notificationResponse",
  /**
   * Push received event.
   */
  PushReceived = "pushReceived",
  /**
   * Register event.
   */
  Register = "register",
  /**
   * Registration event.
   */
  Registration = "registration",
  /**
   * Deep link event.
   */
  DeepLink = "deepLink",
  /**
   * Notification opt-in status event.
   */
  NotificationOptInStatus = "notificationOptInStatus",
  /**
   * Inbox updated event.
   */
  InboxUpdated = "inboxUpdated",
  /**
   * Show inbox event.
   */
  ShowInbox = "showInbox"
}

/**
 * Inbox message object.
 */
export interface InboxMessage {
  /**
   * The message ID. Needed to display, mark as read, or delete the message.
   */
  id: string;
  /**
   * The message title.
   */
  title: string;
  /**
   * The message sent date in milliseconds.
   */
  sentDate: number;
  /**
   * Optional - The icon url for the message.
   */
  listIconUrl: string;
  /**
   * The unread / read status of the message.
   */
  isRead: boolean;
  /**
   * The deleted status of the message.
   */
  isDeleted: boolean;
  /**
   * String to String map of any message extras.
   */
  extras: Record<string, string>;
}

/**
 * Event fired when a push is received.
 */
export interface PushReceivedEvent {
  /**
   * The alert.
   */
  alert?: string;
  /**
   * The title.
   */
  title?: string;
  /**
   * The notification ID.
   */
  notificationId: string;
  /**
   * The notification extras.
   */
  extras: JsonObject;
}

/**
 * Event fired when the user initiates a notification response.
 */
export interface NotificationResponseEvent {
  /**
   * The push notification.
   */
  notification: PushReceivedEvent;
  /**
   * The action button ID, if avilable.
   */
  actionId?: string;
  /**
   * Indicates whether the response was a foreground action.
   * This value is always if the user taps the main notification,
   * otherwise it is defined by the notification action button.
   */
  isForeground: boolean
}

/**
 * Enum of notification options. iOS only.
 */
export enum NotificationOptionsIOS {
  /**
   * Alerts.
   */
  Alert = "alert",
  /**
   * Sounds.
   */
  Sound = "sound",
  /**
   * Badges.
   */
  Badge = "badge"
}

/**
 * A map of notification options. iOS only.
 */
export type NotificationOptionsMapIOS = { [option in NotificationOptionsIOS]: boolean }

/**
 * A map of foreground notification options. iOS only.
 */
export type ForegroundNotificationOptionsIOS = { [option in NotificationOptionsIOS]: boolean | null | undefined }

/**
 * Enum of authorized notification settings. iOS only.
 */
export enum AuthorizedNotificationSettingsIOS {
  /**
   * Alerts.
   */
  Alert = "alert",
  /**
   * Sounds.
   */
  Sound = "sound",
  /**
   * Badges.
   */
  Badge = "badge",
  /**
   * CarPlay.
   */
  CarPlay = "carPlay",
  /**
   * Lock screen.
   */
  LockScreen = "lockScreen",
  /**
   * Notification center.
   */
  NotificationCenter = "notificationCenter"
}

/**
 * A map of authorized notification settings.
 */
export type iOSAuthorizedNotificationSettingsMap = { [setting in AuthorizedNotificationSettingsIOS]: boolean }

/**
 * Event fired when the notification opt-in status changes.
 */
export interface NotificationOptInStatusEvent {
  /**
   * Whether the user is opted in to notifications.
   */
  optIn: boolean;

  /**
   * The authorized notification settings. iOS only.
   */
  authorizedNotificationSettings?: AuthorizedNotificationSettingsIOS;
}

/**
 * Event fired when the inbox is updated.
 */
export interface InboxUpdatedEvent {
  /**
   * The unread message count.
   */
  messageUnreadCount: number;
  /**
   * The total message count.
   */
  messageCount: number
}

/**
 * Event fired when the message center requests the inbox to be displayed.
 */
export interface ShowInboxEvent {
  /**
   * The message ID, if available.
   */
  messageId?: string;
}

/**
 * Event fired when a deep link is opened.
 */
export interface DeepLinkEvent {
  /**
   * The deep link string.
   */
  deepLink: string;
}

/**
 * Event fired when a channel registration occurs.
 */
export interface RegistrationEvent {
  /**
   * The channel ID.
   */
  channelId: string;
  /**
   * The registration token. The registration token might be undefined
   * if registration is currently in progress, if the app is not setup properly
   * for remote notifications, if running on an iOS simulator, or if running on
   * an Android device that has an outdated or missing version of Google Play Services.
   */
  registrationToken?: string
}

/**
 * Converts between public and internal event types.
 * @hidden
 */
function convertEventEnum(type: EventType): string {
  if (type === EventType.NotificationResponse) {
    return InternalEventType.NotificationResponse;
  } else if (type === EventType.PushReceived) {
    return InternalEventType.PushReceived;
  } else if (type === EventType.Register || type === EventType.Registration) {
    return InternalEventType.Registration;
  } else if (type == EventType.DeepLink) {
    return InternalEventType.DeepLink;
  } else if (type == EventType.NotificationOptInStatus) {
    return InternalEventType.NotificationOptInStatus;
  } else if (type == EventType.InboxUpdated) {
    return InternalEventType.InboxUpdated;
  } else if (type == EventType.ShowInbox) {
    return InternalEventType.ShowInbox;
  }

  throw new Error("Invalid event name: " + type);
}

/**
 * Android notification config.
 */
export interface NotificationConfigAndroid {
  /**
   * The icon resource na,e.
   */
  icon?: string;
  /**
   * The large icon resource name.
   */
  largeIcon?: string;
  /**
   * The default android notification channel ID.
   */
  defaultChannelId?: string;
}

/**
* The main Airship API.
*/
export class UrbanAirship {
  /**
   * Sets the Android notification config. Values not set will fallback to any values set in the airship config options.
   *
   * @param config The notification config object.
   */
  static setAndroidNotificationConfig(config: NotificationConfigAndroid) {
    UrbanAirshipModule.setAndroidNotificationConfig(config);
  }

  /**
   * Sets user notifications enabled. The first time user notifications are enabled
   * on iOS, it will prompt the user for notification permissions.
   *
   * @param enabled true to enable notifications, false to disable.
   */
  static setUserNotificationsEnabled(enabled: boolean) {
    UrbanAirshipModule.setUserNotificationsEnabled(enabled);
  }

  /**
   * Checks if user notifications are enabled or not.
   *
   * @return A promise with the result.
   */
  static isUserNotificationsEnabled(): Promise<boolean> {
    return UrbanAirshipModule.isUserNotificationsEnabled();
  }

  /**
   * Global data collection flag. Enabled by default, unless `dataCollectionOptInEnabled`
   * is set to `YES` in AirshipConfig.plist on iOS, and `true` in airshipconfig.properties on Android.
   * When disabled, the device will stop collecting and sending data for named user, events,
   * tags, attributes, associated identifiers, and location from the device.
   *
   * Push notifications will continue to work only if `UrbanAirship.setPushTokenRegistrationEnabled`
   * has been explicitly set to `true`, otherwise it will default to the current state of `isDataCollectionEnabled`.
   *
   * @note To disable by default, set the `dataCollectionOptInEnabled` flag to `YES` in AirshipConfig.plist on iOS, and `true` in airshipconfig.properties on Android.
   * @param enabled true to enable data collection, false to disable.
   */
  static setDataCollectionEnabled(enabled: boolean) {
    UrbanAirshipModule.setDataCollectionEnabled(enabled);
  }

  /**
   * Checks if data collection is enabled or not.
   *
   * @return A promise with the result.
   */
  static isDataCollectionEnabled(): Promise<boolean> {
    return UrbanAirshipModule.isDataCollectionEnabled();
  }

  /**
   * Enables/disables sending the device token during channel registration.
   * Defaults to `UrbanAirship.isDataCollectionEnabled`. If set to `false`, the app will not be able to receive push
   * notifications.
   * @param enabled true to enable push token registration, false to disable.
   */
  static setPushTokenRegistrationEnabled(enabled: boolean) {
    UrbanAirshipModule.setPushTokenRegistrationEnabled(enabled);
  }

  /**
   * Checks if push token registration is enabled or not.
   *
   * @return A promise with the result.
   */
  static isPushTokenRegistrationEnabled(): Promise<boolean> {
    return UrbanAirshipModule.isPushTokenRegistrationEnabled();
  }

  /**
   * Enables user notifications.
   *
   * @return A promise that returns true if enablement was authorized
   * or false if enablement was rejected
   */
  static enableUserPushNotifications(): Promise<boolean> {
    return UrbanAirshipModule.enableUserPushNotifications();
  }

  /**
   * Enables channel creation if `channelCreationDelayEnabled` was
   * enabled in the config.
   */
  static enableChannelCreation() {
    UrbanAirshipModule.enableChannelCreation();
  }

  /**
   * Checks if app notifications are enabled or not. Its possible to have `userNotificationsEnabled`
   * but app notifications being disabled if the user opted out of notifications.
   *
   * @return A promise with the result.
   */
  static isUserNotificationsOptedIn(): Promise<boolean> {
    return UrbanAirshipModule.isUserNotificationsOptedIn();
  }

  /**
   * Sets the named user.
   *
   * @param namedUser The named user string, or null/undefined to clear the named user.
   */
  static setNamedUser(namedUser: string | null | undefined) {
    UrbanAirshipModule.setNamedUser(namedUser);
  }

  /**
   * Gets the named user.
   *
   * @return A promise with the result.
   */
  static getNamedUser(): Promise<string | null | undefined> {
    return UrbanAirshipModule.getNamedUser();
  }

  /**
   * Adds a channel tag.
   *
   * @param tag A channel tag.
   */
  static addTag(tag: string) {
    UrbanAirshipModule.addTag(tag);
  }

  /**
   * Removes a channel tag.
   *
   * @param tag A channel tag.
   */
  static removeTag(tag: string) {
    UrbanAirshipModule.removeTag(tag);
  }

  /**
   * Gets the channel tags.
   *
   * @return A promise with the result.
   */
  static getTags(): Promise<string[]> {
    return UrbanAirshipModule.getTags();
  }

  /**
   * Creates an editor to modify the named user tag groups.
   *
   * @return A tag group editor instance.
   */
  static editNamedUserTagGroups(): TagGroupEditor {
    return new TagGroupEditor((operations: TagGroupOperation[]) => {
      UrbanAirshipModule.editNamedUserTagGroups(operations);
    });
  }

  /**
   * Creates an editor to modify the channel tag groups.
   *
   * @return A tag group editor instance.
   */
  static editChannelTagGroups(): TagGroupEditor {
    return new TagGroupEditor((operations: TagGroupOperation[]) => {
      UrbanAirshipModule.editChannelTagGroups(operations);
    });
  }

  /**
   * Creates an editor to modify the channel attributes.
   *
   * @return An attribute editor instance.
   */
  static editChannelAttributes(): AttributeEditor {
    return new AttributeEditor((operations: AttributeOperation[]) => {
      UrbanAirshipModule.editChannelAttributes(operations);
    });
  }

  /**
   * Creates an editor to modify the named user attributes.
   *
   * @return An attribute editor instance.
   */
  static editNamedUserAttributes(): AttributeEditor {
    return new AttributeEditor((operations: AttributeOperation[]) => {
      UrbanAirshipModule.editNamedUserAttributes(operations);
    });
  }

  /**
   * Enables or disables analytics.
   *
   * Disabling analytics will delete any locally stored events
   * and prevent any events from uploading. Features that depend on analytics being
   * enabled may not work properly if it's disabled (reports, region triggers,
   * location segmentation, push to local time).
   *
   * @param enabled true to enable notifications, false to disable.
   */
  static setAnalyticsEnabled(enabled: boolean) {
    UrbanAirshipModule.setAnalyticsEnabled(enabled);
  }

  /**
   * Checks if analytics is enabled or not.
   *
   * @return A promise with the result.
   */
  static isAnalyticsEnabled(): Promise<boolean> {
    return UrbanAirshipModule.isAnalyticsEnabled();
  }

  /**
   * Initiates screen tracking for a specific app screen, must be called once per tracked screen.
   *
   * @param screen The screen's string identifier
   */
  static trackScreen(screen: string) {
    UrbanAirshipModule.trackScreen(screen);
  }

  /**
   * Gets the channel ID.
   *
   * @return A promise with the result.
   */
  static getChannelId(): Promise<string | null | undefined> {
    return UrbanAirshipModule.getChannelId();
  }

  /**
   * Gets the registration token.
   *
   * @return A promise with the result. The registration token might be undefined
   * if registration is currently in progress, if the app is not setup properly
   * for remote notifications, if running on an iOS simulator, or if running on
   * an Android device that has an outdated or missing version of Google Play Services.
   */
  static getRegistrationToken(): Promise<string | null | undefined> {
    return UrbanAirshipModule.getRegistrationToken();
  }

  /**
   * Associates an identifier for the Connect data stream.
   *
   * @param key The identifier's key.
   * @param id The identifier's id, or null/unefined to clear.
   */
  static associateIdentifier(key: string, id?: string) {
    UrbanAirshipModule.associateIdentifier(key, id);
  }

  /**
   * Adds a custom event.
   *
   * @param event The custom event.
   * @return A promise that returns null if resolved, or an Error if the
   * custom event is rejected.
   */
  static addCustomEvent(event: CustomEvent): Promise<null | Error> {
    const actionArg = {
      event_name: event._name,
      event_value: event._value,
      transaction_id: event._transactionId,
      properties: event._properties
    };

    return new Promise((resolve, reject) => {
      UrbanAirshipModule.runAction("add_custom_event_action", actionArg).then(() => {
        resolve();
      }, (error: Error) => {
        reject(error);
      });
    });
  }

  /**
   * Runs an Urban Airship action.
   *
   * @param name The name of the action.
   * @param value The action's value.
   * @return A promise that returns the action result if the action
   * successfully runs, or the Error if the action was unable to be run.
   */
  static runAction(name: string, value?: JsonValue): Promise<JsonValue | Error> {
    return UrbanAirshipModule.runAction(name, value);
  }

  /**
   * Sets the foregorund presentation options for iOS.
   * This method is only supported on iOS. Android will no-op.
   *
   * @param options The map of options.
   */
  static setForegroundPresentationOptions(options: ForegroundNotificationOptionsIOS) {
    if (Platform.OS == 'ios') {
      return UrbanAirshipModule.setForegroundPresentationOptions(options);
    }
  }

  /**
   * Adds a listener for an Urban Airship event.
   *
   * @param eventType The event type. Either EventType.NotificationResponse, EventType.PushReceived,
   * EventType.Register, EventType.Reistration, EventType.DeepLink, EventType.NotificationOptInStatus,
   * EventType.InboxUpdated, or EventType.ShowInbox.
   * @param listener The event listener.
   * @return An emitter subscription.
   */
  static addListener(eventType: EventType, listener: (...args: any[]) => any): EmitterSubscription {
    return EventEmitter.addListener(convertEventEnum(eventType), listener);
  }

  /**
   * Removes a listener for an Urban Airship event.
   *
   * @param eventType The event type. Either EventType.NotificationResponse, EventType.PushReceived,
   * EventType.Register, EventType.Reistration, EventType.DeepLink, EventType.NotificationOptInStatus,
   * EventType.InboxUpdated, or EventType.ShowInbox.
   * @param listener The event listener. Should be a reference to the function passed into addListener.
   */
  static removeListener(eventType: EventType, listener: (...args: any[]) => any) {
    EventEmitter.removeListener(convertEventEnum(eventType), listener);
  }

  /**
   * Removes all listeners for Urban Airship events.
   *
   * @param eventType The event type. Either EventType.NotificationResponse, EventType.PushReceived,
   * EventType.Register, EventType.Reistration, EventType.DeepLink, EventType.NotificationOptInStatus,
   * EventType.InboxUpdated, or EventType.ShowInbox.
   */
  static removeAllListeners(eventType: EventType) {
    EventEmitter.removeAllListeners(convertEventEnum(eventType));
  }

  /**
   * Enables or disables autobadging on iOS. Badging is not supported for Android.
   *
   * @param enabled Whether or not to enable autobadging.
   */
  static setAutobadgeEnabled(enabled: boolean) {
    if (Platform.OS == 'ios') {
      UrbanAirshipModule.setAutobadgeEnabled(enabled);
    } else {
      console.log("This feature is not supported on this platform.");
    }
  }

  /**
   * Checks to see if autobadging on iOS is enabled. Badging is not supported for Android.
   *
   * @return A promise with the result, either true or false.
   */
  static isAutobadgeEnabled(): Promise<boolean> {
    if (Platform.OS == 'ios') {
      return UrbanAirshipModule.isAutobadgeEnabled();
    } else {
      console.log("This feature is not supported on this platform.");
      return new Promise(resolve => resolve(false));
    }
  }

  /**
   * Sets the badge number for iOS. Badging is not supported for Android.
   *
   * @param badgeNumber The badge number.
   */
  static setBadgeNumber(badgeNumber: number) {
    if (Platform.OS == 'ios') {
      UrbanAirshipModule.setBadgeNumber(badgeNumber);
    } else {
      console.log("This feature is not supported on this platform.");
    }
  }

  /**
   * Gets the current badge number for iOS. Badging is not supported for Android
   * and this method will always return 0.
   *
   * @return A promise with the result.
   */
  static getBadgeNumber(): Promise<number> {
    if (Platform.OS != 'ios') {
      console.log("This feature is not supported on this platform.");
    }
    return UrbanAirshipModule.getBadgeNumber();
  }

  /**
   * Displays the default message center.
   */
  static displayMessageCenter() {
    UrbanAirshipModule.displayMessageCenter();
  }

  /**
   * Dismisses the default message center.
   */
  static dismissMessageCenter() {
    UrbanAirshipModule.dismissMessageCenter();
  }

  /**
   * Displays an inbox message.
   *
   * @param messageId The id of the message to be displayed.
   * @return A promise with the result.
   */
  static displayMessage(messageId: string): Promise<boolean> {
    return UrbanAirshipModule.displayMessage(messageId);
  }

  /**
   * Dismisses the currently displayed inbox message.
   */
  static dismissMessage() {
    UrbanAirshipModule.dismissMessage();
  }

  /**
   * Retrieves the current inbox messages.
   *
   * @return A promise with the result.
   */
  static getInboxMessages(): Promise<InboxMessage[]> {
    return UrbanAirshipModule.getInboxMessages();
  }

  /**
   * Deletes an inbox message.
   *
   * @param messageId The id of the message to be deleted.
   * @return A promise with the result.
   */
  static deleteInboxMessage(messageId: string): Promise<boolean> {
    return UrbanAirshipModule.deleteInboxMessage(messageId);
  }

  /**
   * Marks an inbox message as read.
   *
   * @param messageId The id of the message to be marked as read.
   * @return A promise with the result.
   */
  static markInboxMessageRead(messageId: string): Promise<boolean> {
    return UrbanAirshipModule.markInboxMessageRead(messageId);
  }

  /**
   * Forces the inbox to refresh. This is normally not needed as the inbox will
   * automatically refresh on foreground or when a push arrives that's associated
   * with a message.
   *
   * @return{Promise.<boolean>} A promise with the result.
   */
  static refreshInbox(): Promise<boolean> {
    return UrbanAirshipModule.refreshInbox();
  }

  /**
   * Sets the default behavior when the message center is launched from a push
   * notification. If set to false the message center must be manually launched.
   *
   * @param enabled true to automatically launch the default message center, false to disable.
   */
  static setAutoLaunchDefaultMessageCenter(enabled: boolean) {
    UrbanAirshipModule.setAutoLaunchDefaultMessageCenter(enabled);
  }

  /**
   * Gets all the active notifications for the application.
   * Supported on Android Marshmallow (23)+ and iOS 10+.
   *
   * @return A promise with the result.
   */
  static getActiveNotifications(): Promise<PushReceivedEvent[]> {
    return UrbanAirshipModule.getActiveNotifications();
  }

  /**
   * Clears all notifications for the application.
   * Supported on Android and iOS 10+. For older iOS devices, you can set
   * the badge number to 0 to clear notifications.
   */
  static clearNotifications() {
    UrbanAirshipModule.clearNotifications();
  }

  /**
   * Clears a specific notification.
   * Supported on Android and iOS 10+.
   *
   * @param identifier The notification identifier. The identifier will be
   * available in the PushReceived event and in the active notification response
   * under the "notificationId" field.
   */
  static clearNotification(identifier: string) {
    UrbanAirshipModule.clearNotification(identifier);
  }
}

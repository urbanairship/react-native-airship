// @flow
'use strict';

import {
  NativeModules,
  Platform
} from 'react-native';

import UACustomEvent from './UACustomEvent.js'
import TagGroupEditor from './TagGroupEditor.js'
import AttributeEditor from './AttributeEditor.js'

import UAEventEmitter from './UAEventEmitter.js'

const UrbanAirshipModule = NativeModules.UrbanAirshipReactModule;
const EventEmitter = new UAEventEmitter();

const CHANNEL_REGISTRATION_EVENT = "com.urbanairship.registration";
const NOTIFICATION_RESPONSE_EVENT = "com.urbanairship.notification_response";
const PUSH_RECEIVED_EVENT = "com.urbanairship.push_received";
const DEEP_LINK_EVENT = "com.urbanairship.deep_link";
const INBOX_UPDATED_EVENT = "com.urbanairship.inbox_updated";
const NOTIFICATION_OPT_IN_STATUS = "com.urbanairship.notification_opt_in_status";
const SHOW_INBOX_EVENT = "com.urbanairship.show_inbox";

/**
 * @private
 */
function convertEventEnum(type: UAEventName): ?string {
  if (type === 'notificationResponse') {
    return NOTIFICATION_RESPONSE_EVENT;
  } else if (type === 'pushReceived') {
    return PUSH_RECEIVED_EVENT;
  } else if (type === 'register' || type === 'registration') {
    return CHANNEL_REGISTRATION_EVENT;
  } else if (type == 'deepLink') {
    return DEEP_LINK_EVENT;
  } else if (type == 'notificationOptInStatus') {
    return NOTIFICATION_OPT_IN_STATUS;
  } else if (type == 'inboxUpdated') {
    return INBOX_UPDATED_EVENT;
  } else if (type == 'showInbox') {
    return SHOW_INBOX_EVENT;
  }
  throw new Error("Invalid event name: " + type);
}

export type UAEventName = $Enum<{
  notificationResponse: string,
  pushReceived: string,
  register: string,
  deepLink: string,
  notificationOptInStatus: string,
  inboxUpdated: string,
  showInbox: string
}>;

/**
 * Fired when a user responds to a notification.
 *
 * @event UrbanAirship#notificationResponse
 * @type {object}
 * @param {object} notification The notification.
 * @param {string} notification.alert The notification alert.
 * @param {string} notification.title The notification title.
 * @param {string} notification.notificationId The notification ID.
 * @param {object} notification.extras Any push extras.
 * @param {string=} actionId The ID of the notification action button if available.
 * @param {boolean} isForeground Will always be true if the user taps the main notification. Otherwise its defined by the notification action button.
 */

/**
 * Event fired when a push is received.
 *
 * @event UrbanAirship#pushReceived
 * @type {object}
 * @param {string} alert The notification alert.
 * @param {string} title The notification title.
 * @param {string} notification.notificationId The notification ID.
 * @param {object} extras Any push extras.

 */

/**
 * Event fired when a new deep link is received.
 *
 * @event UrbanAirship#deepLink
 * @type {object}
 * @param {string} deepLink The deep link.
 */

/**
 * Event fired when a channel registration occurs.
 *
 * @event UrbanAirship#register
 * @type {object}
 * @param {string} channelId The channel ID.
 * @param {string} [registrationToken] The registration token. The registration token
 * might be undefined if registration is currently in progress, if the app is not setup properly
 * for remote notifications, if running on an iOS simulator, or if running on an Android
 * device that has an outdated or missing version of Google Play Services.
 */

/**
 * Event fired when the user notification opt-in status changes.
 *
 * @event UrbanAirship#notificationOptInStatus
 * @type {object}
 * @param {boolean} optIn If the user is opted in or not to user notifications.
 * @param {object} [authorizedNotificationSettings] iOS only. A map of authorized settings.
 * @param {boolean} authorizedNotificationSettings.alert If alerts are authorized.
 * @param {boolean} authorizedNotificationSettings.sound If sounds are authorized.
 * @param {boolean} authorizedNotificationSettings.badge If badges are authorized.
 * @param {boolean} authorizedNotificationSettings.carPlay If car play is authorized.
 * @param {boolean} authorizedNotificationSettings.lockScreen If the lock screen is authorized.
 * @param {boolean} authorizedNotificationSettings.notificationCenter If the notification center is authorized.
 */

/**
 * Event fired when the inbox is updated.
 *
 * @event UrbanAirship#inboxUpdated
 * @type {object}
 * @param {number} messageUnreadCount The message unread count.
 * @param {number} messageCount The total message count.
 */

/**
 * Event fired when the inbox needs to be displayed. This event is only emitted if
 * auto launch message center is disabled.
 *
 * @event UrbanAirship#showInbox
 * @type {object}
 * @param {string} [messageId] The optional message ID.
 */

/**
 * The main Urban Airship API.
 */
class UrbanAirship {

  /**
   * Sets the Android notification config. Values not set will fallback to any values set in the airship config options.
   *
   * @param {Object} config The notification config object.
   * @param {string} config.icon The icon resource name.
   * @param {string} config.largeIcon The large icon resource name.
   * @param {string} config.accentColor The accent color in hex format (#AARRGGBB).
   * @param {string} config.defaultChannelId The default channel ID.
   */
  static setAndroidNotificationConfig(config: {icon?: string, largeIcon?: string, accentColor?: string, defaultChannelId?: string }) {
    UrbanAirshipModule.setAndroidNotificationConfig(config);
  }

  /**
   * Sets user notifications enabled. The first time user notifications are enabled
   * on iOS, it will prompt the user for notification permissions.
   *
   * @param {boolean} enabled true to enable notifications, false to disable.
   */
  static setUserNotificationsEnabled(enabled: boolean) {
    UrbanAirshipModule.setUserNotificationsEnabled(enabled);
  }

  /**
   * Checks if user notifications are enabled or not.
   *
   * @return {Promise.<boolean>} A promise with the result.
   */
  static isUserNotificationsEnabled(): Promise<boolean> {
    return UrbanAirshipModule.isUserNotificationsEnabled();
  }

  /**
   * Enables user notifications.
   *
   * @return {Promise.<boolean>} A promise that returns true if enablement was authorized
   * or false if enablement was rejected
   */
  static enableUserPushNotifications(): Promise<boolean> {
    return UrbanAirshipModule.enableUserPushNotifications();
  }

  /**
   * Enables channel creation if `channelCreationDelayEnabled` was
   * enabled in the config.
   *
   */
  static enableChannelCreation() {
    UrbanAirshipModule.enableChannelCreation();
  }

  /**
   * Checks if app notifications are enabled or not. Its possible to have `userNotificationsEnabled`
   * but app notifications being disabled if the user opted out of notifications.
   *
   * @return {Promise.<boolean>} A promise with the result.
   */
  static isUserNotificationsOptedIn(): Promise<boolean> {
    return UrbanAirshipModule.isUserNotificationsOptedIn();
  }

  /**
   * Sets the named user.
   *
   * @param {?string} namedUser The named user string or null to clear the named user.
   */
  static setNamedUser(namedUser: ?string) {
    UrbanAirshipModule.setNamedUser(namedUser);
  }

  /**
   * Gets the named user.
   *
   * @return {Promise.<string>} A promise with the result.
   */
  static getNamedUser(): Promise<?string> {
    return UrbanAirshipModule.getNamedUser();
  }

  /**
   * Adds a channel tag.
   *
   * @param {string} tag A channel tag.
   */
  static addTag(tag: string) {
    UrbanAirshipModule.addTag(tag);
  }

  /**
   * Removes a channel tag.
   *
   * @param {string} tag A channel tag.
   */
  static removeTag(tag: string) {
    UrbanAirshipModule.removeTag(tag);
  }

  /**
   * Gets the channel tags.
   *
   * @return {Promise.<Array>} A promise with the result.
   */
  static getTags(): Promise<Array<string>> {
    return UrbanAirshipModule.getTags();
  }

  /**
   * Creates an editor to modify the named user tag groups.
   *
   * @return {TagGroupEditor} A tag group editor instance.
   */
  static editNamedUserTagGroups(): TagGroupEditor {
    return new TagGroupEditor((operations) => {
      UrbanAirshipModule.editNamedUserTagGroups(operations);
    });
  }

  /**
   * Creates an editor to modify the channel tag groups.
   *
   * @return {TagGroupEditor} A tag group editor instance.
   */
  static editChannelTagGroups(): TagGroupEditor {
    return new TagGroupEditor((operations) => {
      UrbanAirshipModule.editChannelTagGroups(operations);
    });
  }

  /**
   * Creates an editor to modify the channel attributes.
   *
   * @return {AttributeEditor} A attribute editor instance.
   */
  static editChannelAttributes(): AttributeEditor {
    return new AttributeEditor((operations) => {
      UrbanAirshipModule.editChannelAttributes(operations);
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
   * @param {boolean} enabled true to enable notifications, false to disable.
   */
  static setAnalyticsEnabled(enabled: boolean) {
    UrbanAirshipModule.setAnalyticsEnabled(enabled);
  }

  /**
   * Checks if analytics is enabled or not.
   *
   * @return {Promise.<boolean>} A promise with the result.
   */
  static isAnalyticsEnabled(): Promise<boolean> {
    return UrbanAirshipModule.isAnalyticsEnabled();
  }

  /**
    * Initiates screen tracking for a specific app screen, must be called once per tracked screen.
    *
    * @param {String} screen The screen's string identifier.
    */
  static trackScreen(screen: string) {
    UrbanAirshipModule.trackScreen(screen);
  }

  /**
   * Gets the channel ID.
   *
   * @return {Promise.<string>} A promise with the result.
   */
  static getChannelId(): Promise<?string> {
    return UrbanAirshipModule.getChannelId();
  }

  /**
   * Gets the registration token.
   *
   * @return {Promise.<string>} A promise with the result. The registration token
   * might be undefined if registration is currently in progress, if the app is not setup properly
   * for remote notifications, if running on an iOS simulator, or if running on an Android
   * device that has an outdated or missing version of Google Play Services.
   */
  static getRegistrationToken(): Promise<?string> {
    return UrbanAirshipModule.getRegistrationToken();
  }

  /**
   * Associates an identifier for the Connect data stream.
   *
   * @param {string} key The identifier's key.
   * @param {string} value The identifier's value.
   */
  static associateIdentifier(key: string, id: ?string) {
    UrbanAirshipModule.associateIdentifier(key, id);
  }

  /**
   * Adds a custom event.
   *
   * @param {UACustomEvent} event The custom event.
   * @return {Promise.<null, Error>}  A promise that returns null if resolved, or an Error if the
   * custom event is rejected.
   */
  static addCustomEvent(event: UACustomEvent): Promise {
    var actionArg = {
      event_name: event._name,
      event_value: event._value,
      transaction_id: event._transactionId,
      properties: event._properties
    }

    return new Promise((resolve, reject) => {
            UrbanAirshipModule.runAction("add_custom_event_action", actionArg)
                              .then(() => {
                                  resolve();
                               }, (error) => {
                                 reject(error);
                               });
        });
  }

  /**
   * Enables or disables Urban Airship location services.
   *
   * Note: On iOS, location services require an additional dependency
   * on AirshipLocationKit. For more information see
   * https://docs.airship.com/platform/react-native/location/
   *
   * @param {boolean} enabled true to enable location, false to disable.
   */
  static setLocationEnabled(enabled: boolean) {
    UrbanAirshipModule.setLocationEnabled(enabled);
  }

  /**
   * Allows or disallows location services to continue in the background.
   *
   * Note: On iOS, location services require an additional dependency
   * on AirshipLocationKit. For more information see
   * https://docs.airship.com/platform/react-native/location/
   *
   * @param {boolean} allowed true to allow background location, false to disallow.
   */
  static setBackgroundLocationAllowed(allowed: boolean) {
    UrbanAirshipModule.setBackgroundLocationAllowed(allowed);
  }

  /**
   * Checks if location is enabled or not.
   *
   * Note: On iOS, location services require an additional dependency
   * on AirshipLocationKit. For more information see
   * https://docs.airship.com/platform/react-native/location/
   *
   * @return {Promise.<boolean>} A promise with the result.
   */
  static isLocationEnabled(): Promise<boolean> {
    return UrbanAirshipModule.isLocationEnabled();
  }

  /**
   * Checks if background location is allowed or not.
   *
   * Note: On iOS, location services require an additional dependency
   * on AirshipLocationKit. For more information see
   * https://docs.airship.com/platform/react-native/location/
   *
   * @return {Promise.<boolean>} A promise with the result.
   */
  static isBackgroundLocationAllowed(): Promise<boolean> {
    return UrbanAirshipModule.isBackgroundLocationAllowed();
  }

  /**
   * Runs an Urban Airship action.
   *
   * @param {string} name The name of the action.
   * @param {*} value The action's value.
   * @return {Promise.<*, Error>}  A promise that returns the action result if the action
   * successfully runs, or the Error if the action was unable to be run.
   */
  static runAction(name: string, value: ?any) : Promise<any> {
    return UrbanAirshipModule.runAction(name, value);
  }

  /**
   * Sets the foregorund presentation options for iOS.
   *
   * This method is only supported on iOS >= 10. Android and older iOS devices
   * will no-op.
   *
   * @param {Object} options The a map of options.
   * @param {boolean} [options.alert] True to display an alert when a notification is received in the foreground, otherwise false.
   * @param {boolean} [options.sound] True to play a sound when a notification is received in the foreground, otherwise false.
   * @param {boolean} [options.badge] True to update the badge when a notification is received in the foreground, otherwise false.
   */
  static setForegroundPresentationOptions(options: { alert: ?boolean, badge: ?boolean, sound: ?boolean}) {
    if (Platform.OS == 'ios') {
      return UrbanAirshipModule.setForegroundPresentationOptions(options);
    }
  }

  /**
   * Adds a listener for an Urban Airship event.
   *
   * @param {string} eventName The event name. Either notificationResponse, pushReceived,
   * register, deepLink, or notificationOptInStatus.
   * @param {Function} listener The event listner.
   * @return {EmitterSubscription} An emitter subscription.
   */
  static addListener(eventName: UAEventName, listener: Function): EmitterSubscription {
    var name = convertEventEnum(eventName);
    return EventEmitter.addListener(name, listener);
  }

  /**
   * Removes a listener for an Urban Airship event.
   *
   * @param {string} eventName The event name. Either notificationResponse, pushReceived,
   * register, deepLink, or notificationOptInStatus.
   * @param {Function} listener The event listner.
   */
  static removeListener(eventName: AirshipEventName, listener: Function) {
    var name = convertEventEnum(eventName);
    EventEmitter.removeListener(name, listener);
  }

  /**
     * Sets the quiet time.
     *
     * @param {Object} quiteTime The quiet time object.
     * @param {number} quiteTime.startHour Start hour.
     * @param {number} quiteTime.startMinute Start minute.
     * @param {number} quiteTime.endHour End hour.
     * @param {number} quiteTime.endMinute End minute.
     */
  static setQuietTime(quietTime: {startHour?: number, startMinute?: number, endHour?: number, endMinute?: number }) {
    return UrbanAirshipModule.setQuietTime(quietTime);
  }

  /**
   * Returns the quiet time as an object with the following:
   * "startHour": Number,
   * "startMinute": Number,
   * "endHour": Number,
   * "endMinute": Number
   *
   * @return {Promise.Object} A promise with the result.
   */
  static getQuietTime(): Promise<Object> {
    return UrbanAirshipModule.getQuietTime();
  }

  /**
   * Enables or disables quiet time.
   *
   * @param {boolean} enabled true to enable quiet time, false to disable.
   */
  static setQuietTimeEnabled(enabled: boolean) {
    UrbanAirshipModule.setQuietTimeEnabled(enabled);
  }

  /**
   * Checks if quietTime is enabled or not.
   *
   * @return {Promise.<boolean>} A promise with the result.
   */
  static isQuietTimeEnabled(): Promise<boolean> {
    return UrbanAirshipModule.isQuietTimeEnabled();
  }

  /**
   * Enables or disables autobadging on iOS. Badging is not supported for Android.
   *
   * @param {boolean} enabled Whether or not to enable autobadging.
   */
  static setAutobadgeEnabled(enabled: boolean) {
    if (Platform.OS == 'ios') {
      UrbanAirshipModule.setAutobadgeEnabled(enabled);
    } else {
      console.log("This feature is not supported on this platform.")
    }
}

  /**
   * Checks to see if autobadging on iOS is enabled. Badging is not supported for Android.
   *
   * @return {Promise.<boolean>} A promise with the result, either true or false.
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
   * @param {number} badgeNumber specified badge to set.
   */
  static setBadgeNumber(badgeNumber: number) {
    if (Platform.OS == 'ios') {
      UrbanAirshipModule.setBadgeNumber(badgeNumber);
    } else {
      console.log("This feature is not supported on this platform.")
    }
  }

  /**
   * Gets the current badge number for iOS. Badging is not supported for Android
   * and this method will always return 0.
   *
   * @return {Promise.<number>} A promise with the result.
   */
  static getBadgeNumber(): Promise<number> {
    if (Platform.OS != 'ios') {
      console.log("This feature is not supported on this platform.")
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
   * @param {string} messageId The id of the message to be displayed.
   * @return {Promise.<boolean>} A promise with the result.
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
   * Retrieves the current inbox messages. Each message will have the following properties:
   * "id": string - The messages ID. Needed to display, mark as read, or delete the message.
   * "title": string - The message title.
   * "sentDate": number - The message sent date in milliseconds.
   * "listIconUrl": string, optional - The icon url for the message.
   * "isRead": boolean - The unread/read status of the message.
   * "isDeleted": boolean - The deleted status of the message.
   * "extras": object - String to String map of any message extras.
   *
   * @return {Promise.<Array>} A promise with the result.
   */
  static getInboxMessages(): Promise<Array> {
    return UrbanAirshipModule.getInboxMessages();
  }

  /**
   * Deletes an inbox message.
   *
   * @param {string} messageId The id of the message to be deleted.
   * @return {Promise.<boolean>} A promise with the result.
   */
  static deleteInboxMessage(messageId: string): Promise<boolean> {
    return UrbanAirshipModule.deleteInboxMessage(messageId);
  }

  /**
   * Marks an inbox message as read.
   *
   * @param {string} messageId The id of the message to be marked as read.
   * @return {Promise.<boolean>} A promise with the result.
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
   * @param {boolean} [enabled=true] true to automatically launch the default message center, false to disable.
   */
  static setAutoLaunchDefaultMessageCenter(enabled: boolean) {
    UrbanAirshipModule.setAutoLaunchDefaultMessageCenter(enabled);
  }

  /**
   * Gets all the active notifications for the application.
   * Supported on Android Marshmallow (23)+ and iOS 10+.
   *
   * @return {Promise.<Array>} A promise with the result.
   */
  static getActiveNotifications(): Promise<Array> {
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
   * @param {string} identifier The notification identifier. The identifier will
   * available in the pushReceived event and in the active notification response
   * under the "notificationId" field.
   */
  static clearNotification(identifier: string) {
    UrbanAirshipModule.clearNotification(identifier)
  }
}

module.exports = UrbanAirship;

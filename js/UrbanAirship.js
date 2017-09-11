// @flow
'use strict';

import {
  NativeEventEmitter,
  NativeModules,
  Platform
} from 'react-native';

import UACustomEvent from './UACustomEvent.js'
import TagGroupEditor from './TagGroupEditor.js'

const UrbanAirshipModule = NativeModules.UrbanAirshipReactModule;
const AirshipNotificationEmitter = new NativeEventEmitter(UrbanAirshipModule);

const CHANNEL_REGISTRATION_EVENT = "com.urbanairship.registration";
const NOTIFICATION_RESPONSE_EVENT = "com.urbanairship.notification_response";
const PUSH_RECEIVED_EVENT = "com.urbanairship.push_received";
const DEEP_LINK_EVENT = "com.urbanairship.deep_link";
const INBOX_UPDATED_EVENT = "com.urbanairship.inbox_updated";
const NOTIFICATION_OPT_IN_STATUS = "com.urbanairship.notification_opt_in_status";


/**
 * @private
 */
function convertEventEnum(type: UAEventName): ?string {
  if (type === 'notificationResponse') {
    return NOTIFICATION_RESPONSE_EVENT;
  } else if (type === 'pushReceived') {
    return PUSH_RECEIVED_EVENT;
  } else if (type === 'register') {
    return CHANNEL_REGISTRATION_EVENT;
  } else if (type == 'deepLink') {
    return DEEP_LINK_EVENT;
  } else if (type == 'notificationOptInStatus') {
    return NOTIFICATION_OPT_IN_STATUS;
  } else if (type == 'inboxUpdated') {
    return INBOX_UPDATED_EVENT;
  }
  return "";
}

export type UAEventName = $Enum<{
  notificationResponse: string,
  pushReceived: string,
  register: string,
  deepLink: string,
  notificationOptInStatus: string
}>;


/**
 * Fired when a user responds to a notification.
 *
 * @event UrbanAirship#notificationResponse
 * @type {object}
 * @param {object} notification The notification.
 * @param {string} notification.alert The notification alert.
 * @param {string} notification.title The notification title.
 * @param {object} notification.extras Any push extras.
 * @param {string=} actionId The ID of the notification action button if available.
 * @param {boolean} isForeground Will always be true if the user taps the main notification. Otherwise its defined by the notificaiton action button.
 */

/**
 * Event fired when a push is received.
 *
 * @event UrbanAirship#pushReceived
 * @type {object}
 * @param {string} alert The notification alert.
 * @param {string} title The notification title.
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
 * @param {string} [registrationToken] The registration token.
 */

/**
 * Event fired when the user notification opt-in status changes.
 *
 * @event UrbanAirship#notificationOptInStatus
 * @type {object}
 * @param {boolean} optIn If the user is opted in or not to user notifications.
 * @param {object} [notificationOptions] iOS only. A map of opted in options.
 * @param {boolean} notificationOptions.alert If the user is opted into alerts.
 * @param {boolean} notificationOptions.sound If the user is opted into sounds.
 * @param {boolean} notificationOptions.badge If the user is opted into badge updates.
 */

 /**
  * Event fired when the inbox is updated.
  *
  * @event UrbanAirship#inboxUpdated
  * @type {object}
  * @param {number} messageUnreadCount The message unread count.
  * @param {number} messageCount THe total message count.
  */

/**
 * The main Urban Airship API.
 */
class UrbanAirship {

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
   * Gets the channel ID.
   *
   * @return {Promise.<string>} A promise with the result.
   */
  static getChannelId(): Promise<?string> {
    return UrbanAirshipModule.getChannelId();
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
   * @param {boolean} enabled true to enable location, false to disable.
   */
  static setLocationEnabled(enabled: boolean) {
    UrbanAirshipModule.setLocationEnabled(enabled);
  }

  /**
   * Allows or disallows location services to continue in the background.
   *
   * @param {boolean} allowed true to allow background location, false to disallow.
   */
  static setBackgroundLocationAllowed(allowed: boolean) {
    UrbanAirshipModule.setBackgroundLocationAllowed(allowed);
  }

  /**
   * Checks if location is enabled or not.
   *
   * @return {Promise.<boolean>} A promise with the result.
   */
  static isLocationEnabled(): Promise<boolean> {
    return UrbanAirshipModule.isLocationEnabled();
  }

  /**
   * Checks if background location is allowed or not.
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
   * @param {boolean} [options.alert=false] True to display an alert when a notification is received in the foreground, otherwise false.
   * @param {boolean} [options.sound=false] True to play a sound when a notification is received in the foreground, otherwise false.
   * @param {boolean} [options.badge=false] True to update the badge when a notification is received in the foreground, otherwise false.
   */
  static setForegroundPresentationOptions(options: { alert?: boolean, badge?: boolean, sound?: boolean}) {
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
    return AirshipNotificationEmitter.addListener(name, listener);
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
    AirshipNotificationEmitter.removeListener(name, listener);
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
   * @param {boolean} [overlay=false] Display the message in an overlay.
   * @return {Promise.<boolean>} A promise with the result.
   */
  static displayMessage(messageId: string, overlay: ?boolean): Promise<boolean> {
    return UrbanAirshipModule.displayMessage(messageId, overlay);
  }

  /**
   * Dismisses the currently displayed inbox message. 
   *
   * @param {boolean} [overlay=false] Dismisses the message in an overlay.
   */
  static dismissMessage(overlay: ?boolean) {
    UrbanAirshipModule.dismissMessage(overlay);
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
}

module.exports = UrbanAirship;

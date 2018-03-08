import { EmitterSubscription } from 'react-native';

/**
 * Urban Airship Custom events
 **/
declare class UACustomEvent {
    /**
     * Custom event constructor.
     *
     * @param {string} name The event name.
     * @param {number=} value The event value.
     */
    constructor(name: string, value?: number);
    /**
     * The event's transaction ID.
    */
    transactionId(value?: string): string | undefined;
    /**
     * Adds a property to the custom event.
     *
     * @param {string} name The property name.
     * @param {string|number|boolean|string[]} value The property value.
     */
    addProperty(name: string, value: string | number | boolean | Array<string>): void;
}

declare interface Operation {
    operationType: string,
    group: string,
    tags: Array<string>,
}

/** Editor for tag groups. **/
declare class TagGroupEditor {
    constructor(onApply: (operations: Array<Operation>) => any);
    /**
     * Adds tags to a tag group.
     *
     * @param {string} tagGroup The tag group.
     * @param {array<string>} tags Tags to add.
     * @return {TagGroupEditor} The tag group editor instance.
     */
    addTags(group: string, tags: Array<string>): TagGroupEditor;
    /**
     * Removes tags from the tag group.
     * @instance
     * @memberof TagGroupEditor
     * @function removeTags
     *
     * @param {string} tagGroup The tag group.
     * @param {array<string>} tags Tags to remove.
     * @return {TagGroupEditor} The tag group editor instance.
     */
    removeTags(group: string, tags: Array<string>): TagGroupEditor;
    /**
     * Applies the tag changes.
     * @instance
     * @memberof TagGroupEditor
     * @function apply
     */
    apply(): void;
}

declare interface Message {
    /** The messages ID.Needed to display, mark as read, or delete the message. **/
    id: string;
    /** The message title. **/
    title: string;
    /** The message sent date in milliseconds. **/
    sentDate: number;
    /** ptional - The icon url for the message. **/
    listIconUrl: string;
    /** The unread / read status of the message. **/
    isRead: boolean;
    /** The deleted status of the message. **/
    isDeleted: boolean;
    /** String to String map of any message extras. **/
    extras: Map<string, any>;
}

declare type Listener = (response: any) => void;

/**
 * The main Urban Airship API.
 */
export class UrbanAirship {
    /**
     * Sets user notifications enabled. The first time user notifications are enabled
     * on iOS, it will prompt the user for notification permissions.
     *
     * @param {boolean} enabled true to enable notifications, false to disable.
     */
    static setUserNotificationsEnabled(enabled: boolean): void;

    /**
     * Checks if user notifications are enabled or not.
     *
     * @return {Promise.<boolean>} A promise with the result.
     */
    static isUserNotificationsEnabled(): Promise<boolean>;

    /**
     * Checks if app notifications are enabled or not. Its possible to have `userNotificationsEnabled`
     * but app notifications being disabled if the user opted out of notifications.
     *
     * @return {Promise.<boolean>} A promise with the result.
     */
    static isUserNotificationsOptedIn(): Promise<boolean>;

    /**
     * Sets the named user.
     *
     * @param {?string} namedUser The named user string or null to clear the named user.
     */
    static setNamedUser(namedUser?: string): void;

    /**
     * Gets the named user.
     *
     * @return {Promise.<string>} A promise with the result.
     */
    static getNamedUser(): Promise<string | undefined>;

    /**
     * Adds a channel tag.
     *
     * @param {string} tag A channel tag.
     */
    static addTag(tag: string): void;

    /**
     * Removes a channel tag.
     *
     * @param {string} tag A channel tag.
     */
    static removeTag(tag: string): void;

    /**
     * Gets the channel tags.
     *
     * @return {Promise.<Array>} A promise with the result.
     */
    static getTags(): Promise<Array<string>>;

    /**
     * Creates an editor to modify the named user tag groups.
     *
     * @return {TagGroupEditor} A tag group editor instance.
     */
    static editNamedUserTagGroups(): TagGroupEditor;

    /**
     * Creates an editor to modify the channel tag groups.
     *
     * @return {TagGroupEditor} A tag group editor instance.
     */
    static editChannelTagGroups(): TagGroupEditor;

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
    static setAnalyticsEnabled(enabled: boolean): void;

    /**
     * Checks if analytics is enabled or not.
     *
     * @return {Promise.<boolean>} A promise with the result.
     */
    static isAnalyticsEnabled(): Promise<boolean>;

    /**
     * Gets the channel ID.
     *
     * @return {Promise.<string>} A promise with the result.
     */
    static getChannelId(): Promise<string | undefined>;

    /**
     * Gets the registration token.
     *
     * @return {Promise.<string>} A promise with the result.
     */
    static getRegistrationToken(): Promise<string | undefined>;

    /**
     * Associates an identifier for the Connect data stream.
     *
     * @param {string} key The identifier's key.
     * @param {string} value The identifier's value.
     */
    static associateIdentifier(key: string, id?: string): void;

    /**
     * Adds a custom event.
     *
     * @param {UACustomEvent} event The custom event.
     * @return {Promise.<null, Error>}  A promise that returns null if resolved, or an Error if the
     * custom event is rejected.
     */
    static addCustomEvent(event: UACustomEvent): Promise<void>;

    /**
     * Enables or disables Urban Airship location services.
     *
     * @param {boolean} enabled true to enable location, false to disable.
     */
    static setLocationEnabled(enabled: boolean): void;

    /**
     * Allows or disallows location services to continue in the background.
     *
     * @param {boolean} allowed true to allow background location, false to disallow.
     */
    static setBackgroundLocationAllowed(allowed: boolean): void;

    /**
     * Checks if location is enabled or not.
     *
     * @return {Promise.<boolean>} A promise with the result.
     */
    static isLocationEnabled(): Promise<boolean>;

    /**
     * Checks if background location is allowed or not.
     *
     * @return {Promise.<boolean>} A promise with the result.
     */
    static isBackgroundLocationAllowed(): Promise<boolean>;

    /**
     * Runs an Urban Airship action.
     *
     * @param {string} name The name of the action.
     * @param {*} value The action's value.
     * @return {Promise.<*, Error>}  A promise that returns the action result if the action
     * successfully runs, or the Error if the action was unable to be run.
     */
    static runAction(name: string, value?: any): Promise<any>;

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
    static setForegroundPresentationOptions(options: { alert?: boolean, badge?: boolean, sound?: boolean }): any;

    /**
     * Adds a listener for an Urban Airship event.
     *
     * @param {string} eventName The event name. Either notificationResponse, pushReceived,
     * register, deepLink, or notificationOptInStatus.
     * @param {Function} listener The event listner.
     * @return {EmitterSubscription} An emitter subscription.
     */
    static addListener(eventName: string, listener: Listener): EmitterSubscription;

    /**
     * Removes a listener for an Urban Airship event.
     *
     * @param {string} eventName The event name. Either notificationResponse, pushReceived,
     * register, deepLink, or notificationOptInStatus.
     * @param {Function} listener The event listner.
     */
    static removeListener(eventName: string, listener: Listener): void;

    /**
         * Sets the quiet time.
         *
         * @param {Object} quiteTime The quiet time object.
         * @param {number} quiteTime.startHour Start hour.
         * @param {number} quiteTime.startMinute Start minute.
         * @param {number} quiteTime.endHour End hour.
         * @param {number} quiteTime.endMinute End minute.
         */
    static setQuietTime(quietTime: { startHour?: number, startMinute?: number, endHour?: number, endMinute?: number }): any;

    /**
     * Returns the quiet time as an object with the following:
     * "startHour": Number,
     * "startMinute": Number,
     * "endHour": Number,
     * "endMinute": Number
     *
     * @return {Promise.Object} A promise with the result.
     */
    static getQuietTime(): Promise<Object>;

    /**
     * Enables or disables quiet time.
     *
     * @param {boolean} enabled true to enable quiet time, false to disable.
     */
    static setQuietTimeEnabled(enabled: boolean): void;

    /**
     * Checks if quietTime is enabled or not.
     *
     * @return {Promise.<boolean>} A promise with the result.
     */
    static isQuietTimeEnabled(): Promise<boolean>;

    /**
     * Sets the badge number for iOS. Badging is not supported for Android.
     *
     * @param {number} badgeNumber specified badge to set.
     */
    static setBadgeNumber(badgeNumber: number): void;

    /**
     * Gets the current badge number for iOS. Badging is not supported for Android
     * and this method will always return 0.
     *
     * @return {Promise.<number>} A promise with the result.
     */
    static getBadgeNumber(): Promise<number>;

    /**
     * Displays the default message center.
     */
    static displayMessageCenter(): void;

    /**
     * Dismisses the default message center.
     */
    static dismissMessageCenter(): void;

    /**
     * Displays an inbox message.
     *
     * @param {string} messageId The id of the message to be displayed.
     * @param {boolean} [overlay=false] Display the message in an overlay.
     * @return {Promise.<boolean>} A promise with the result.
     */
    static displayMessage(messageId: string, overlay?: boolean): Promise<boolean>;

    /**
     * Dismisses the currently displayed inbox message.
     *
     * @param {boolean} [overlay=false] Dismisses the message in an overlay.
     */
    static dismissMessage(overlay?: boolean): void;

    /**
     * Retrieves the current inbox messages.
     * @return {Promise.<Array>} A promise with the result.
     */
    static getInboxMessages(): Promise<Array<Message>>;

    /**
     * Deletes an inbox message.
     *
     * @param {string} messageId The id of the message to be deleted.
     * @return {Promise.<boolean>} A promise with the result.
     */
    static deleteInboxMessage(messageId: string): Promise<boolean>;

    /**
     * Marks an inbox message as read.
     *
     * @param {string} messageId The id of the message to be marked as read.
     * @return {Promise.<boolean>} A promise with the result.
     */
    static markInboxMessageRead(messageId: string): Promise<boolean>;

    /**
     * Forces the inbox to refresh. This is normally not needed as the inbox will
     * automatically refresh on foreground or when a push arrives that's associated
     * with a message.
     *
     * @return{Promise.<boolean>} A promise with the result.
     */
    static refreshInbox(): Promise<boolean>;

    /**
     * Sets the default behavior when the message center is launched from a push
     * notification. If set to false the message center must be manually launched.
     *
     * @param {boolean} [enabled=true] true to automatically launch the default message center, false to disable.
     */
    static setAutoLaunchDefaultMessageCenter(enabled: boolean): void;

    /**
     * Gets all the active notifications for the application.
     * Supported on Android Marshmallow (23)+ and iOS 10+.
     *
     * @return {Promise.<Array>} A promise with the result.
     */
    static getActiveNotifications(): Promise<Array<any>>;

    /**
     * Clears all notificaitons for the application.
     * Supported on Android and iOS 10+. For older iOS devices, you can set
     * the badge number to 0 to clear notificaitons.
     *
     * @param {boolean} [enabled=true] true to automatically launch the default message center, false to disable.
     */
    static clearNotifications(): void;

    /**
     * Clears a specific notification.
     * Supported on Android and iOS 10+.
     *
     * @param {string} identifier The notification identifier. The identifier will
     * available in the pushReceived event and in the active notificaiton response
     * under the "notificationId" field.
     */
    static clearNotification(identifier: string): void;
}

export module UrbanAirship {
    export enum Event {
        notificationResponse = 'notificationResponse',
        pushReceived = 'pushReceived',
        register = 'register',
        deepLink = 'deepLink',
        notificationOptInStatus = 'notificationOptInStatus',
        inboxUpdated = 'inboxUpdated',
        showInbox = 'showInbox',
    }
}

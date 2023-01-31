export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonArray;

export type JsonObject = {
  [key: string]: JsonValue;
};

export type JsonArray = JsonValue[];

export interface ChannelCreatedEvent {
  /**
   * The channel ID.
   */
  channelId: string
}

export interface PushTokenReceivedEvent {
  /**
   * The push token.
   */
  pushToken: string
}

/**
 * Event fired when a push is received.
 */
export interface PushReceivedEvent {
  pushPayload: PushPayload;
}

/**
 * The push payload.
 */
export interface PushPayload {
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
  notificationId?: string;
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
  pushPayload: PushPayload;

  /**
   * The action button ID, if available.
   */
  actionId?: string;

  /**
   * Indicates whether the response was a foreground action.
   * This value is always if the user taps the main notification,
   * otherwise it is defined by the notification action button.
   */
  isForeground: boolean;
}

export interface NotificationStatus {
  /**
   * If airship is opted in for push notifications are not.
   */
  airshipOptIn: boolean;

  /**
   * If notifications are enabled on Airship or not.
   */
  airshipEnabled: boolean;

  /**
   * If notifications are enabled in the app settings or not.
   */
  systemEnabled: boolean;

  /**
   * iOS status.
   */
  ios?: {
    /**
     * Authorized settings.
     */
    authorizedSettings: [iOS.AuthorizedNotificationSetting];

    /**
     * Authorized status.
     */
    authorizedStatus: iOS.AuthorizedNotificationStatus;
  };
}

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
  authorizedSettings?: [iOS.AuthorizedNotificationSetting];
}

/**
 * Event fired when the Message Center  is updated.
 */
export interface MessageCenterUpdatedEvent {
  /**
   * The unread message count.
   */
  messageUnreadCount: number;
  /**
   * The total message count.
   */
  messageCount: number;
}

/**
 * Event fired when the Message Center is requested to be displayed.
 */
export interface DisplayMessageCenterEvent {
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
 * Event fired when a preference center is requested to be displayed.
 */
export interface DisplayPreferenceCenterEvent {
  /**
   * The preference center Id.
   */
  preferenceCenterId: string;
}

export enum EventType {
  ChannelCreated = 'com.airship.channel_created',
  NotificationResponse = 'com.airship.notification_response',
  PushReceived = 'com.airship.push_received',
  DeepLink = 'com.airship.deep_link',
  MessageCenterUpdated = 'com.airship.message_center_updated',
  NotificationOptInStatus = 'com.airship.notification_opt_in_status',
  DisplayMessageCenter = 'com.airship.display_message_center',
  DisplayPreferenceCenter = 'com.airship.display_preference_center',
  PushTokenReceived = 'com.airship.push_token_received',
}

export interface EventTypeMap {
  [EventType.ChannelCreated]: ChannelCreatedEvent,
  [EventType.NotificationResponse]: NotificationResponseEvent,
  [EventType.PushReceived]: PushReceivedEvent,
  [EventType.DeepLink]: DeepLinkEvent,
  [EventType.MessageCenterUpdated]: MessageCenterUpdatedEvent,
  [EventType.NotificationOptInStatus]: NotificationOptInStatusEvent,
  [EventType.DisplayMessageCenter]: DisplayMessageCenterEvent,
  [EventType.DisplayPreferenceCenter]: DisplayPreferenceCenterEvent,
  [EventType.PushTokenReceived]: PushTokenReceivedEvent
}


/**
 * iOS options
 */
export namespace iOS {
  /**
   * Enum of notification options. iOS only.
   */
  export enum NotificationOption {
    /**
     * Alerts.
     */
    Alert = 'alert',
    /**
     * Sounds.
     */
    Sound = 'sound',
    /**
     * Badges.
     */
    Badge = 'badge',
    /**
     * Car play.
     */
    CarPlay = 'car_play',
    /**
     * Critical Alert.
     */
    CriticalAlert = 'critical_alert',
    /**
     * Provides app notification settings.
     */
    ProvidesAppNotificationSettings = 'provides_app_notification_settings',
    /**
     * Provisional.
     */
    Provisional = 'provisional',
  }

  /**
   * Enum of foreground notification options.
   */
  export enum ForegroundPresentationOption {
    /**
     * Play the sound associated with the notification.
     */
    Sound = 'sound',
    /**
     * Apply the notification's badge value to the app’s icon.
     */
    Badge = 'badge',

    /**
     * Show the notification in Notification Center. On iOS 13 an older,
     * this will also show the notification as a banner.
     */
    List = 'list',

    /**
     * Present the notification as a banner. On iOS 13 an older,
     * this will also show the notification in the Notification Center.
     */
    Banner = 'banner',
  }

  /**
   * Enum of authorized notification settings.
   */
  export enum AuthorizedNotificationSetting {
    /**
     * Alerts.
     */
    Alert = 'alert',
    /**
     * Sounds.
     */
    Sound = 'sound',
    /**
     * Badges.
     */
    Badge = 'badge',
    /**
     * CarPlay.
     */
    CarPlay = 'car_play',
    /**
     * Lock screen.
     */
    LockScreen = 'lock_screen',
    /**
     * Notification center.
     */
    NotificationCenter = 'notification_center',
    /**
     * Critical alert.
     */
    CriticalAlert = 'critical_alert',
    /**
     * Announcement.
     */
    Announcement = 'announcement',
    /**
     * Scheduled delivery.
     */
    ScheduledDelivery = 'scheduled_delivery',
    /**
     * Time sensitive.
     */
    TimeSensitive = 'time_sensitive',
  }

  /**
   * Enum of authorized status.
   */
  export enum AuthorizedNotificationStatus {
    /**
     * Not determined.
     */
    NotDetermined = 'not_determined',

    /**
     * Denied.
     */
    Denied = 'denied',

    /**
     * Authorized.
     */
    Authorized = 'authorized',

    /**
     * Provisional.
     */
    Provisional = 'provisional',

    /**
     * Ephemeral.
     */
    Ephemeral = 'ephemeral',
  }
}

export interface NotificationStatus {
  /**
   * If airship is opted in for push notifications are not.
   */
  airshipOptIn: boolean;

  /**
   * If notifications are enabled on Airship or not.
   */
  airshipEnabled: boolean;

  /**
   * If notifications are enabled in the app settings or not.
   */
  systemEnabled: boolean;

  /**
   * iOS status.
   */
  ios?: {
    /**
     * Authorized settings.
     */
    authorizedSettings: [iOS.AuthorizedNotificationSetting];

    /**
     * Authorized status.
     */
    authorizedStatus: iOS.AuthorizedNotificationStatus;
  };
}

/**
 * Airship config environment
 */
export interface ConfigEnvironment {
  /**
   * App key.
   */
  appKey: string;

  /**
   * App secret.
   */
  appSecret: string;

  /**
   * Optional log level.
   */
  logLevel?: LogLevel;
}

/**
 * Possible sites.
 */
export type Site = 'us' | 'eu';

/**
 * Log levels.
 */
export type LogLevel =
  | 'verbose'
  | 'debug'
  | 'info'
  | 'warning'
  | 'error'
  | 'none';

/**
 * Airship config
 */
export interface AirshipConfig {
  /**
   * Default environment.
   */
  default?: ConfigEnvironment;

  /**
   * Development environment. Overrides default environment if inProduction is false.
   */
  development?: ConfigEnvironment;

  /**
   * Production environment. Overrides default environment if inProduction is true.
   */
  production?: ConfigEnvironment;

  /**
   * Cloud site.
   */
  site?: Site;

  /**
   * Switches the environment from development or production. If the value is not
   * set, Airship will determine the value at runtime.
   */
  inProduction?: boolean;

  /**
   * URL allow list.
   */
  urlAllowList?: string[];

  /**
   * URL allow list for open URL scope.
   */
  urlAllowListScopeOpenUrl?: string[];

  /**
   * URL allow list for JS bridge injection.
   */
  urlAllowListScopeJavaScriptInterface?: string[];

  /**
   * Enables delayed channel creation.
   */
  isChannelCreationDelayEnabled?: boolean;

  /**
   * Initial config URL for custom Airship domains. The URL
   * should also be added to the urlAllowList.
   */
  initialConfigUrl?: string;

  /**
   * Enabled features. Defaults to all.
   */
  enabledFeatures?: Feature[];

  /**
   * iOS config.
   */
  ios?: {
    /**
     * itunesId for rate app and app store deep links.
     */
    itunesId?: string;
  };

  /**
   * Android config.
   */
  android?: {
    /**
     * App store URI
     */
    appStoreUri?: string;

    /**
     * Fcm app name if using multiple FCM projects.
     */
    fcmFirebaseAppName?: string;

    /**
     * Notification config.
     */
    notificationConfig?: Android.NotificationConfig;
  };
}

export namespace Android {
  /**
   * Android notification config.
   */
  export interface NotificationConfig {
    /**
     * The icon resource name.
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
    /**
     * The accent color. Must be a hex value #AARRGGBB.
     */
    accentColor?: string;
  }
}

/**
 * Enum of authorized Features.
 */
export enum Feature {
  None = 'none',
  InAppAutomation = 'in_app_automation',
  MessageCenter = 'message_center',
  Push = 'push',
  Chat = 'chat',
  Analytics = 'analytics',
  TagsAndAttributes = 'tags_and_attributes',
  Contacts = 'contacts',
  Location = 'location',
  All = 'all',
}

/**
 * Subscription Scope types.
 */
export enum SubscriptionScope {
  App = 'app',
  Web = 'web',
  Sms = 'sms',
  Email = 'email',
}

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

// ---
// See: https://github.com/urbanairship/web-push-sdk/blob/master/src/remote-data/preference-center.ts
// ---

/**
 * A preference center definition.
 *
 * @typedef {object} PreferenceCenter
 * @property {string} id the ID of the preference center
 * @property {Array<PreferenceCenter.CommonSection>} sections a list of sections
 * @property {?CommonDisplay} display display information
 */
export type PreferenceCenter = {
  id: string;
  sections: Section[];
  display?: CommonDisplay;
};

/**
 * Preference center display information.
 * @typedef {object} CommonDisplay
 * @property {string} name
 * @property {?string} description
 */
export type CommonDisplay = {
  name: string;
  description?: string;
};

export type Icon = {
  icon: string;
};

export type IconDisplay = CommonDisplay & Partial<Icon>;

export interface ItemBase {
  type: unknown;
  id: string;
  display: CommonDisplay;
  conditions?: Condition[];
}

/**
 * A channel subscription item.
 * @typedef {object} ChannelSubscriptionItem
 * @memberof PreferenceCenter
 * @property {"channel_subscription"} type
 * @property {string} id the item identifier
 * @property {?CommonDisplay} display display information
 * @property {string} subscription_id the subscription list id
 */
export interface ChannelSubscriptionItem extends ItemBase {
  type: 'channel_subscription';
  subscription_id: string;
}

export interface ContactSubscriptionGroupItem extends ItemBase {
  type: 'contact_subscription_group';
  id: string;
  subscription_id: string;
  components: ContactSubscriptionGroupItemComponent[];
}

export interface ContactSubscriptionGroupItemComponent {
  scopes: SubscriptionScope[];
  display: Omit<CommonDisplay, 'description'>;
}

export interface ContactSubscriptionItem extends ItemBase {
  type: 'contact_subscription';
  scopes: SubscriptionScope[];
  subscription_id: string;
}

export interface AlertItem extends ItemBase {
  type: 'alert';
  display: IconDisplay;
  button?: Button;
}

export interface ConditionBase {
  type: unknown;
}

export interface NotificationOptInCondition extends ConditionBase {
  type: 'notification_opt_in';
  when_status: 'opt_in' | 'opt_out';
}

export type Condition = NotificationOptInCondition;

// Changed from `unknown` in spec
export type Actions = {
  [key: string]: JsonValue;
};

export interface Button {
  text: string;
  content_description?: string;
  actions: Actions;
}

export interface SectionBase {
  type: unknown;
  id: string;
  display?: CommonDisplay;
  items: Item[];
}

/**
 * @typedef {object} CommonSection
 * @memberof PreferenceCenter
 * @property {"section"} type
 * @property {string} id the section identifier
 * @property {?CommonDisplay} display display information
 * @property {Array<PreferenceCenter.ChannelSubscriptionItem>} items list of
 *   section items
 */
export interface CommonSection extends SectionBase {
  type: 'section';
}

export interface LabeledSectionBreak extends SectionBase {
  type: 'labeled_section_break';
  items: never;
}

export type Item =
  | ChannelSubscriptionItem
  | ContactSubscriptionGroupItem
  | ContactSubscriptionItem
  | AlertItem;

export type Section = CommonSection | LabeledSectionBreak;

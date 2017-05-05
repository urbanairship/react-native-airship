// @flow
'use strict';

import {
  NativeEventEmitter,
  NativeModules,
  Platform
} from 'react-native';

import { UACustomEvent } from './UACustomEvent.js'
import { TagGroupEditor } from './TagGroupEditor.js'

const UrbanAirshipModule = NativeModules.UrbanAirshipReactModule;
const AirshipNotificationEmitter = new NativeEventEmitter(UrbanAirshipModule);

const CHANNEL_REGISTRATION_EVENT = "com.urbanairship.registration";
const NOTIFICATION_RESPONSE_EVENT = "com.urbanairship.notification_response";
const PUSH_RECEIVED_EVENT = "com.urbanairship.push_received";
const DEEP_LINK_EVENT = "com.urbanairship.deep_link";
const NOTIFICATION_OPT_IN_STATUS = "com.urbanairship.notification_opt_in_status";

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
  }
  return "";
}

class UrbanAirship {
  static setUserNotificationsEnabled(enabled: boolean) {
    UrbanAirshipModule.setUserNotificationsEnabled(enabled);
  }

  static isUserNotificationsEnabled(): Promise<boolean> {
    return UrbanAirshipModule.isUserNotificationsEnabled();
  }

  static isUserNotificationsOptedIn(): Promise<boolean> {
    return UrbanAirshipModule.isUserNotificationsOptedIn();
  }

  static setNamedUser(namedUser: ?string) {
    UrbanAirshipModule.setNamedUser(namedUser);
  }

  static getNamedUser(): Promise<?string> {
    return UrbanAirshipModule.getNamedUser();
  }

  static addTag(tag: string) {
    UrbanAirshipModule.addTag(tag);
  }

  static removeTag(tag: string) {
    UrbanAirshipModule.removeTag(tag);
  }

  static getTags(): Promise<Array<string>> {
    return UrbanAirshipModule.getTags();
  }

  static editNamedUserTagGroups(): TagGroupEditor {
    return new TagGroupEditor((operations) => {
      UrbanAirshipModule.editNamedUserTagGroups(operations);
    });
  }
  static editChannelTagGroups(): TagGroupEditor {
    return new TagGroupEditor((operations) => {
      UrbanAirshipModule.editChannelTagGroups(operations);
    });
  }

  static setAnalyticsEnabled(enabled: boolean) {
    UrbanAirshipModule.setAnalyticsEnabled(enabled);
  }

  static isAnalyticsEnabled(): Promise<boolean> {
    return UrbanAirshipModule.isAnalyticsEnabled();
  }

  static getChannelId(): Promise<?string> {
    return UrbanAirshipModule.getChannelId();
  }

  static associateIdentifier(key: string, id: ?string) {
    UrbanAirshipModule.associateIdentifier(key, id);
  }

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

  static setLocationEnabled(enabled: boolean) {
    UrbanAirshipModule.setLocationEnabled(enabled);
  }

  static setBackgroundLocationAllowed(allowed: boolean) {
    UrbanAirshipModule.setBackgroundLocationAllowed(allowed);
  }

  static isLocationEnabled(): Promise<boolean> {
    return UrbanAirshipModule.isLocationEnabled();
  }

  static isBackgroundLocationAllowed(): Promise<boolean> {
    return UrbanAirshipModule.isBackgroundLocationAllowed();
  }

  static runAction(name: string, value: ?any) : Promise<any> {
    return UrbanAirshipModule.runAction(name, value);
  }

  static setForegroundPresentationOptions(options: { alert?: boolean, badge?: boolean, sound?: boolean}) {
    if (Platform.OS == 'ios') {
      return UrbanAirshipModule.setForegroundPresentationOptions(options);
    }
  }

  static addListener(type: UAEventName, listener: Function): EmitterSubscription {
    var eventName = convertEventEnum(type);
    return AirshipNotificationEmitter.addListener(eventName, listener);
  }

  static removeListener(type: AirshipEventName, handler: Function) {
    var eventName = convertEventEnum(type);
    AirshipNotificationEmitter.removeListener(eventName, listener);
  }

}

module.exports = UrbanAirship;

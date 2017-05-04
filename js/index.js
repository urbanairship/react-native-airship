
// @flow

'use strict';

import {
  NativeEventEmitter,
  NativeModules,
  Platform
} from 'react-native';


const UrbanAirshipModule = NativeModules.UrbanAirshipReactModule;
const AirshipNotificationEmitter = new NativeEventEmitter(UrbanAirshipModule);

const CHANNEL_REGISTRATION_EVENT = "com.urbanairship.registration";
const NOTIFICATION_RESPONSE_EVENT = "com.urbanairship.notification_response";
const PUSH_RECEIVED_EVENT = "com.urbanairship.push_received";

export type AirshipEventName = $Enum<{
  notificationResponse: string,

  registration: string,

  pushReceived: string,
}>;

function convertEventEnum(type: AirshipEventName): ?string {
  if (type === 'notificationResponse') {
    return NOTIFICATION_RESPONSE_EVENT;
  } else if (type === 'pushReceived') {
    return PUSH_RECEIVED_EVENT;
  } else if (type === 'register') {
    return CHANNEL_REGISTRATION_EVENT;
  }
  return null;
}

class UrbanAirship {
  static setUserNotificationsEnabled(enabled: boolean) {
    UrbanAirshipModule.setUserNotificationsEnabled(enabled);
  }

  static isUserNotificationsEnabled(): Promise<boolean> {
    return UrbanAirshipModule.isUserNotificationsEnabled();
  }

  static addListener(type: AirshipEventName, listener: Function): EmitterSubscription {
    var eventName = convertEventEnum(type);
    return AirshipNotificationEmitter.addListener(eventName, listener);
  }

  static removeListener(type: AirshipEventName, handler: Function) {
    var eventName = convertEventEnum(type);
    AirshipNotificationEmitter.removeListener(eventName, listener);
  }



}

module.exports = UrbanAirship;

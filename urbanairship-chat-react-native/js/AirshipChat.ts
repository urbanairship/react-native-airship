/* Copyright Airship and Contributors */

'use strict';

import {
  NativeModules,
} from 'react-native';

const AirshipChatModule = NativeModules.AirshipChatReactModule;

/**
 * The Airship Chat API.
 */
export declare class AirshipChat {
  static openChat() {
    AirshipChatModule.openChat();
  }
}

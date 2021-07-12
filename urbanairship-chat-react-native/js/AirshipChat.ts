/* Copyright Airship and Contributors */

'use strict';

import { NativeModules } from 'react-native';
import { UrbanAirship } from 'urbanairship-react-native'
import { UAEventEmitter } from 'urbanairship-react-native/js/UAEventEmitter'

/**
 * @hidden
 */
const AirshipChatModule = NativeModules.AirshipChatModule;
const UrbanAirshipModule = NativeModules.UrbanAirshipReactModule;

/**
 * @hidden
 */
const EventEmitter = new UAEventEmitter();

/**
 * A listener subscription.
 */
export class Subscription {
  onRemove: () => void;
  constructor(onRemove: () => void) {
    this.onRemove = onRemove;
  }
  /**
   * Removes the listener.
   */
  remove(): void {
    this.onRemove();
  }
}

/**
 * Chat message object
 */
 export interface ChatMessage {
  /**
   * The message ID.
   */
  messageId: string;
  /**
   * The message text.
   */
  text: string;
  /**
   * The message creation date in milliseconds.
   */
  createdOn: number;
  /**
   * The direction of the message (incoming = 1 or outgoing = 0)
   */
  direction: boolean;
  /**
   * The attachment URL.
   */
  attachmentUrl: string;
  /**
   * The pending status.
   */
  pending: boolean;
 } 

/**
 * The Airship Chat API.
 */
export class AirshipChat {
  static openChat() {
    AirshipChatModule.openChat();
  }

  static sendMessage(message: string) {
    AirshipChatModule.sendMessage(message);
  }

  static sendMessageWithAttachment(message: string, attachmentUrl: string) {
    AirshipChatModule.sendMessage(message, attachmentUrl);
  }

  static getMessages(): Promise<ChatMessage[]> {
    return AirshipChatModule.getMessages();
  }

  static addConversationListener(listener: (...args: any[]) => any): Subscription {
    EventEmitter.addListener("com.urbanairship.conversation_updated", listener);
    return new Subscription(() => {
      UrbanAirship.removeListener("com.urbanairship.conversation_updated", listener);
    });
  }
}

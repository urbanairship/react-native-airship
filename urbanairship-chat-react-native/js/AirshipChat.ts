/* Copyright Airship and Contributors */

'use strict';

import { NativeModules } from 'react-native';
import { EventType, UrbanAirship, Subscription } from 'urbanairship-react-native'

/**
 * @hidden
 */
const AirshipChatModule = NativeModules.AirshipChatModule;


/**
 * Enum of possible message directions
 */
export enum MessageDirection {
  /**
   * The message is outgoing.
   */
  DirectionOutgoing = 0,
  /**
   * The message is incoming.
   */
  DirectionIncoming = 1
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
  text?: string;
  /**
   * The message creation date in milliseconds.
   */
  createdOn: number;
  /**
   * The direction of the message (incoming = 1 or outgoing = 0)
   */
  direction: MessageDirection;
  /**
   * The attachment URL.
   */
  attachmentUrl?: string;
  /**
   * The pending status.
   */
  pending: boolean;
 } 

/**
 * The Airship Chat API.
 */
export class AirshipChat {
  static connect() {
    AirshipChatModule.connect();
  }

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
    return UrbanAirship.addListener(EventType.ConversationUpdated, listener);
  }

  static addChatOpenListener(listener: (...args: any[]) => any): Subscription {
    return UrbanAirship.addListener(EventType.OpenChat, listener);
  }

  static setUseCustomChatUI(useCustomUI: boolean) {
    AirshipChatModule.setUseCustomChatUI(useCustomUI);
  }
}

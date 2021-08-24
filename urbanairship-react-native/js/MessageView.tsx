/* Copyright Airship and Contributors */

'use strict';

import React from "react";
import { requireNativeComponent, NativeSyntheticEvent } from "react-native";


const UARCTMessageView = requireNativeComponent<UARCTMessageViewProps>('UARCTMessageView');

interface UARCTMessageViewProps {
  messageId: string;
  onLoadStarted: (event: NativeSyntheticEvent<MessageLoadStartedEvent>) => void;
  onLoadFinished: (event: NativeSyntheticEvent<MessageLoadFinishedEvent>) => void;
  onLoadError: (event: NativeSyntheticEvent<MessageLoadErrorEvent>) => void;
  onClose: (event: NativeSyntheticEvent<MessageClosedEvent>) => void;
}

/**
 * Enum of possible message load errors
 */
export enum MessageLoadError {
  /**
   * The message is not available.
   */
  NotAvailable = "MESSAGE_NOT_AVAILABLE",
  /**
   * Failed to fetch the message.
   */
  FetchFailed = "FAILED_TO_FETCH_MESSAGE",
  /**
   * Failed to load the message.
   */
  LoadFailed = "MESSAGE_LOAD_FAILED"
}

/**
 * Message load started event.
 */
export interface MessageLoadStartedEvent {
  /**
   * The message ID.
   */
  messageId: string
}

/**
 * Message load finished event.
 */
export interface MessageLoadFinishedEvent {
  /**
   * The message ID.
   */
  messageId: string
}

/**
 * Message load error event.
 */
export interface MessageLoadErrorEvent {
  /**
   * The message ID.
   */
  messageId: string
  /**
   * Whether the failure is retryable.
   */
  retryable: boolean
  /**
   * The error
   */
  error: MessageLoadError
}

/**
 * Message closed event
 */
export interface MessageClosedEvent {
  /**
   * The message ID.
   */
  messageId: string
}

/**
 * MessageView props
 */
export interface MessageViewProps  {
  /**
   * A callback when the view starts loading a message.
   *
   * @param event: The message load started event.
   */
  onLoadStarted: (event: MessageLoadStartedEvent) => void;
  /**
   * A callback when the view finishes loading a message.
   *
   * @param event: The message load finished event.
   */
  onLoadFinished: (event: MessageLoadFinishedEvent) => void;
  /**
   * A callback when the view fails to load a message with an error.
   *
   * @param event: The message load error event.
   */
  onLoadError: (event: MessageLoadErrorEvent) => void;
  /**
   * A callback when the message is closed.
   *
   * @param event: The message closed event.
   */
  onClose: (event: MessageClosedEvent) => void;

  /**
   * The message Id.
   */
  messageId: string;
}

/**
 * Inbox message view component.
 */
export class MessageView extends React.Component<MessageViewProps> {

  _onLoadStarted = (event: NativeSyntheticEvent<MessageLoadStartedEvent>) => {
    if (!this.props.onLoadStarted) {
      return;
    }
    this.props.onLoadStarted(event.nativeEvent);
  };

  _onLoadFinished = (event: NativeSyntheticEvent<MessageLoadFinishedEvent>) => {
    if (!this.props.onLoadFinished) {
      return;
    }
    this.props.onLoadFinished(event.nativeEvent);
  };

  _onLoadError = (event: NativeSyntheticEvent<MessageLoadErrorEvent>) => {
    if (!this.props.onLoadError) {
      return;
    }
    this.props.onLoadError(event.nativeEvent);
  };

  _onClose = (event: NativeSyntheticEvent<MessageClosedEvent>) => {
    if (!this.props.onClose) {
      return;
    }
    this.props.onClose(event.nativeEvent);
  };

  render() {
    return <UARCTMessageView {...this.props} onLoadError={this._onLoadError} onLoadStarted={this._onLoadStarted} onLoadFinished={this._onLoadFinished} onClose={this._onClose} />;
  }
}


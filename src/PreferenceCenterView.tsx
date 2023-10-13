/* Copyright Airship and Contributors */

'use strict';

import React from 'react';
import { NativeSyntheticEvent } from 'react-native';
import RTNAirshipPreferenceCenterView from './PreferenceCenterViewNativeComponent';

/**
 * Enum of possible preference center load errors
 */
export enum PreferenceCenterLoadError {
  /**
   * The preference center is not available.
   */
  NotAvailable = 'PREFERENCE_CENTER_NOT_AVAILABLE',
  /**
   * Failed to fetch the preference center.
   */
  FetchFailed = 'FAILED_TO_FETCH_PREFERENCE_CENTER',
  /**
   * Failed to load the preference center.
   */
  LoadFailed = 'PREFERENCE_CENTER_LOAD_FAILED',
}

/**
 * Preference center load started event.
 */
export interface PreferenceCenterLoadStartedEvent {
  /**
   * The preference center ID.
   */
  preferenceCenterId: string;
}

/**
 * Preference center load finished event.
 */
export interface PreferenceCenterLoadFinishedEvent {
  /**
   * The preference center ID.
   */
  preferenceCenterId: string;
}

/**
 * Preference center load error event.
 */
export interface PreferenceCenterLoadErrorEvent {
  /**
   * The preference center ID.
   */
  preferenceCenterId: string;
  /**
   * Whether the failure is retryable.
   */
  retryable: boolean;
  /**
   * The error
   */
  error: string;
}

/**
 * Preference center closed event
 */
export interface PreferenceCenterClosedEvent {
  /**
   * The preference center ID.
   */
  preferenceCenterId: string;
}

/**
 * PreferenceCenterView props
 */
export interface PreferenceCenterViewProps {
  // /**
  //  * A callback when the view starts loading a preference center.
  //  *
  //  * @param event: The preference center load started event.
  //  */
  // onLoadStarted: (event: PreferenceCenterLoadStartedEvent) => void;
  // /**
  //  * A callback when the view finishes loading a preference center.
  //  *
  //  * @param event: The preference center load finished event.
  //  */
  // onLoadFinished: (event: PreferenceCenterLoadFinishedEvent) => void;
  // /**
  //  * A callback when the view fails to load a preference center with an error.
  //  *
  //  * @param event: The preference center load error event.
  //  */
  // onLoadError: (event: PreferenceCenterLoadErrorEvent) => void;
  // /**
  //  * A callback when the preference center is closed.
  //  *
  //  * @param event: The preference center closed event.
  //  */
  // onClose: (event: PreferenceCenterClosedEvent) => void;

  /**
   * The preference center Id.
   */
  preferenceCenterId: string;
}

/**
 * Preference center view component.
 */
export class PreferenceCenterView extends React.Component<PreferenceCenterViewProps> {
  // _onLoadStarted = (event: NativeSyntheticEvent<PreferenceCenterLoadStartedEvent>) => {
  //   if (!this.props.onLoadStarted) {
  //     return;
  //   }
  //   this.props.onLoadStarted(event.nativeEvent);
  // };

  // _onLoadFinished = (event: NativeSyntheticEvent<PreferenceCenterLoadFinishedEvent>) => {
  //   if (!this.props.onLoadFinished) {
  //     return;
  //   }
  //   this.props.onLoadFinished(event.nativeEvent);
  // };

  // _onLoadError = (event: NativeSyntheticEvent<PreferenceCenterLoadErrorEvent>) => {
  //   if (!this.props.onLoadError) {
  //     return;
  //   }
  //   this.props.onLoadError(event.nativeEvent);
  // };

  // _onClose = (event: NativeSyntheticEvent<PreferenceCenterClosedEvent>) => {
  //   if (!this.props.onClose) {
  //     return;
  //   }
  //   this.props.onClose(event.nativeEvent);
  // };

  render() {
    return (
      <RTNAirshipPreferenceCenterView
        {...this.props}
        // onLoadError={this._onLoadError}
        // onLoadStarted={this._onLoadStarted}
        // onLoadFinished={this._onLoadFinished}
        // onClose={this._onClose}
      />
    );
  }
}

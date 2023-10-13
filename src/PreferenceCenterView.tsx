/* Copyright Airship and Contributors */

'use strict';

import React from 'react';
import RTNAirshipPreferenceCenterView from './PreferenceCenterViewNativeComponent';

/**
 * PreferenceCenterView props
 */
export interface PreferenceCenterViewProps {
  /**
   * The preference center Id.
   */
  preferenceCenterId: string;
}

/**
 * Preference center view component.
 */
export class PreferenceCenterView extends React.Component<PreferenceCenterViewProps> {
  render() {
    return (
      <RTNAirshipPreferenceCenterView
        {...this.props}
      />
    );
  }
}

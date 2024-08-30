/* Copyright Airship and Contributors */

'use strict';

import React from 'react';
import RTNAirshipEmbeddedView from './AirshipEmbeddedViewNativeComponent';

/**
 * AirshipEmbeddedView props
 */
export interface AirshipEmbeddedViewProp {
  /**
   * The embedded Id.
   */
  embeddedId: string;
}

/**
 * Inbox message view component.
 */
export class AirshipEmbeddedView extends React.Component<AirshipEmbeddedViewProp> {
  render() {
    return (
      <RTNAirshipEmbeddedView
        {...this.props}
      />
    );
  }
}

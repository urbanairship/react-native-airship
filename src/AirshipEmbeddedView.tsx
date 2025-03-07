/* Copyright Airship and Contributors */

'use strict';

import React from 'react';
import RNAirshipEmbeddedView from './AirshipEmbeddedViewNativeComponent';

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
 * Airship Embedded view.
 */
export class AirshipEmbeddedView extends React.Component<AirshipEmbeddedViewProp> {
  render() {
    return (
      <RNAirshipEmbeddedView
        {...this.props}
      />
    );
  }
}

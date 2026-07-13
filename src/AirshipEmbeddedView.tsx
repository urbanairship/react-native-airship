/* Copyright Airship and Contributors */

'use strict';

import React from 'react';
import RNAirshipEmbeddedView from './RNAirshipEmbeddedViewNativeComponent';
import { ViewStyle } from 'react-native';

/**
 * Controls which pending embedded content instance is displayed when more
 * than one is available for the same embedded ID.
 */
export type AirshipEmbeddedViewSelection =
  | { type: 'priority' }
  | { type: 'instance_id'; instanceId: string };

/**
 * AirshipEmbeddedView props
 */
export interface AirshipEmbeddedViewProp {
  style?: ViewStyle;

  /**
   * The embedded Id.
   */
  embeddedId: string;

  /**
   * How to select which pending content to display when more than one is
   * available. Defaults to priority ordering.
   */
  selection?: AirshipEmbeddedViewSelection;
}

/**
 * Airship Embedded view.
 */
export class AirshipEmbeddedView extends React.Component<AirshipEmbeddedViewProp> {
  render() {
    const { style, embeddedId, selection } = this.props;
    return (
      <RNAirshipEmbeddedView
        style={style}
        config={JSON.stringify({ embeddedId, selection })}
      />
    );
  }
}

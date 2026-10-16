/* Copyright Airship and Contributors */

'use strict';

import React from 'react';
import { NativeSyntheticEvent, ViewStyle } from 'react-native';
import RNAirshipEmbeddedCarousel from './RNAirshipEmbeddedCarouselNativeComponent';
import type { AirshipEmbeddedViewSelection } from './AirshipEmbeddedView';

/**
 * AirshipEmbeddedCarousel state.
 */
export interface AirshipEmbeddedCarouselState {
  /**
   * The index of the visible page. `0` when no content is available.
   */
  currentPage: number;

  /**
   * The number of pages (pending instances) available for the embedded ID.
   */
  pageCount: number;

  /**
   * Whether any content is available to display.
   */
  isAvailable: boolean;
}

/**
 * AirshipEmbeddedCarousel props
 */
export interface AirshipEmbeddedCarouselProp {
  style?: ViewStyle;

  /**
   * The embedded Id.
   */
  embeddedId: string;

  /**
   * How to select which pending content is included and its ordering.
   * Defaults to priority ordering.
   */
  selection?: AirshipEmbeddedViewSelection;

  /**
   * The page to display. Setting a new value navigates the carousel to that
   * page (clamped to the last page). If content is not available yet, the
   * navigation happens once it is. When omitted the carousel manages its own
   * page; use `onPageChanged` to track it.
   */
  currentPage?: number;

  /**
   * Called when the visible page changes.
   */
  onPageChanged?: (currentPage: number) => void;

  /**
   * Called when the number of pages changes.
   */
  onPageCountChanged?: (pageCount: number) => void;

  /**
   * Called when content availability changes.
   */
  onAvailabilityChanged?: (isAvailable: boolean) => void;

  /**
   * Called when any of the carousel state changes.
   */
  onStateChanged?: (state: AirshipEmbeddedCarouselState) => void;
}

/**
 * Airship Embedded carousel. Displays every pending instance for an embedded
 * ID as swipeable pages, using the default page indicator and arrows.
 *
 * Sizing follows the same rules as {@link AirshipEmbeddedView}.
 */
export class AirshipEmbeddedCarousel extends React.Component<AirshipEmbeddedCarouselProp> {
  private lastState?: AirshipEmbeddedCarouselState;

  private onStateChange = (
    event: NativeSyntheticEvent<AirshipEmbeddedCarouselState>
  ) => {
    const { currentPage, pageCount, isAvailable } = event.nativeEvent;
    const previous = this.lastState;
    this.lastState = { currentPage, pageCount, isAvailable };

    if (!previous || previous.currentPage !== currentPage) {
      this.props.onPageChanged?.(currentPage);
    }
    if (!previous || previous.pageCount !== pageCount) {
      this.props.onPageCountChanged?.(pageCount);
    }
    if (!previous || previous.isAvailable !== isAvailable) {
      this.props.onAvailabilityChanged?.(isAvailable);
    }
    this.props.onStateChanged?.(this.lastState);
  };

  render() {
    const { style, embeddedId, selection, currentPage } = this.props;
    return (
      <RNAirshipEmbeddedCarousel
        style={style}
        config={JSON.stringify({ embeddedId, selection })}
        page={currentPage !== undefined && currentPage >= 0 ? Math.floor(currentPage) : -1}
        onStateChange={this.onStateChange}
      />
    );
  }
}

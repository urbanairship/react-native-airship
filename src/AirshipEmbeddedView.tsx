/* Copyright Airship and Contributors */

import { useCallback, useState } from 'react';
import type { NativeSyntheticEvent, ViewStyle } from 'react-native';
import RNAirshipEmbeddedView from './RNAirshipEmbeddedViewNativeComponent';

/**
 * Controls which pending embedded content instance is displayed when more
 * than one is available for the same embedded ID.
 */
export type AirshipEmbeddedViewSelection =
  | { type: 'priority' }
  | { type: 'instance_id'; instanceId: string };

/**
 * Reports the measured height of the embedded content.
 */
export interface AirshipEmbeddedViewSizeChangeEvent {
  /**
   * The content height, in points.
   */
  height: number;
}

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

  /**
   * Called whenever the measured content height changes. Only emitted while the
   * view is sizing to its content.
   *
   * @param event The size change event.
   */
  onSizeChange?: (event: AirshipEmbeddedViewSizeChangeEvent) => void;
}

/**
 * Heights at or below this are treated as the content failing to resolve one,
 * rather than as a real measurement.
 */
const MIN_CONTENT_HEIGHT = 1;

/**
 * Whether the view measures its own content.
 *
 * It does so only when nothing else determines the height: a caller that states
 * one, in any form, keeps it.
 *
 * @param style The style passed to the view.
 * @returns `true` when the view should size to its content.
 */
export function isSelfSizing(style?: ViewStyle): boolean {
  if (style == null) {
    return true;
  }
  return (
    style.height == null &&
    style.minHeight == null &&
    style.maxHeight == null &&
    style.aspectRatio == null &&
    style.flex == null &&
    style.flexBasis == null
  );
}

/**
 * The style to hand the native view.
 *
 * @param style The style passed to the view.
 * @param contentHeight The last measured content height, if any.
 * @returns The style, with a height only when the view is sizing itself and has
 * a usable measurement.
 */
export function resolveStyle(
  style?: ViewStyle,
  contentHeight?: number
): ViewStyle | undefined {
  if (!isSelfSizing(style)) {
    return style;
  }
  if (contentHeight == null || contentHeight <= MIN_CONTENT_HEIGHT) {
    return style;
  }
  return { ...style, height: contentHeight };
}

/**
 * Airship Embedded view.
 *
 * Sizes to its content unless the style states a height. While sizing itself it
 * reports each measurement through `onSizeChange`.
 */
export function AirshipEmbeddedView({
  style,
  embeddedId,
  selection,
  onSizeChange,
}: AirshipEmbeddedViewProp) {
  const [contentHeight, setContentHeight] = useState<number | undefined>(
    undefined
  );
  const selfSizing = isSelfSizing(style);

  const handleSizeChange = useCallback(
    (event: NativeSyntheticEvent<AirshipEmbeddedViewSizeChangeEvent>) => {
      const { height } = event.nativeEvent;
      setContentHeight(height);
      onSizeChange?.({ height });
    },
    [onSizeChange]
  );

  return (
    <RNAirshipEmbeddedView
      style={resolveStyle(style, contentHeight)}
      config={JSON.stringify({ embeddedId, selection })}
      sizeToContent={selfSizing}
      onSizeChange={handleSizeChange}
    />
  );
}

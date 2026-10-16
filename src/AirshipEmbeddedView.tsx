/* Copyright Airship and Contributors */

import { forwardRef, useCallback, useState } from 'react';
import type {
  ComponentRef,
  ForwardRefExoticComponent,
  RefAttributes,
} from 'react';
import type { NativeSyntheticEvent, StyleProp, ViewStyle } from 'react-native';
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
  style?: StyleProp<ViewStyle>;

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
   * Whether the view takes its height from the content instead of filling the
   * box it is given. Defaults to false.
   *
   * The measured height overrides any height in `style`, so a view whose height
   * comes from its layout should leave this off.
   */
  sizeToContent?: boolean;

  /**
   * Called whenever the measured content height changes. Only emitted while
   * `sizeToContent` is set.
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
 * The style to hand the native view.
 *
 * The height is appended rather than merged in, so a caller who passes an array
 * or a registered style keeps every entry and only the height is overridden.
 *
 * @param style The style passed to the view.
 * @param sizeToContent Whether the caller asked the view to size itself.
 * @param contentHeight The last measured content height, if any.
 * @returns The style, carrying a height only when the caller asked for one and
 * a usable measurement has arrived.
 */
function resolveStyle(
  style: StyleProp<ViewStyle>,
  sizeToContent: boolean,
  contentHeight?: number
): StyleProp<ViewStyle> {
  if (!sizeToContent) {
    return style;
  }
  if (contentHeight == null || contentHeight <= MIN_CONTENT_HEIGHT) {
    return style;
  }
  return [style, { height: contentHeight }];
}

/**
 * The native view handed to a `ref` on {@link AirshipEmbeddedView}.
 */
export type AirshipEmbeddedViewInstance = ComponentRef<
  typeof RNAirshipEmbeddedView
>;

/**
 * Airship Embedded view.
 *
 * Fills the box it is given. Set `sizeToContent` to have it take the height of
 * its content instead and report each measurement through `onSizeChange`.
 */
export const AirshipEmbeddedView: ForwardRefExoticComponent<
  AirshipEmbeddedViewProp & RefAttributes<AirshipEmbeddedViewInstance>
> = forwardRef(function AirshipEmbeddedView(
  { style, embeddedId, selection, sizeToContent = false, onSizeChange },
  ref
) {
  const [contentHeight, setContentHeight] = useState<number | undefined>(
    undefined
  );

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
      ref={ref}
      style={resolveStyle(style, sizeToContent, contentHeight)}
      config={JSON.stringify({ embeddedId, selection })}
      sizeToContent={sizeToContent}
      onSizeChange={handleSizeChange}
    />
  );
});

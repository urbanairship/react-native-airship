/* Copyright Airship and Contributors */

import type { AirshipEmbeddedViewSelection } from './AirshipEmbeddedView';

/**
 * Puts the selection into the one shape the native side reads.
 *
 * The config crosses as a JSON string and the Android view rebuilds whenever
 * that string changes, so a single ID and a one-entry list have to produce the
 * same string or switching between them re-inflates the view.
 *
 * @param selection The selection as the caller wrote it.
 * @returns The selection with any instance ID expressed as a list.
 */
export function normalizeSelection(
  selection?: AirshipEmbeddedViewSelection
): AirshipEmbeddedViewSelection | undefined {
  if (selection?.type !== 'instance_id') {
    return selection;
  }
  const { instanceId } = selection;
  return {
    type: 'instance_id',
    instanceId: typeof instanceId === 'string' ? [instanceId] : instanceId,
  };
}

/* Copyright Airship and Contributors */

import { afterEach, describe, expect, it } from '@jest/globals';
import { emit, reset } from '../../jest/react-native';
import { AirshipInApp, type PendingEmbedded } from '../AirshipInApp';
import { UAEventEmitter } from '../UAEventEmitter';

const PENDING_EVENTS = 'com.airship.pending_events';
const PENDING_EMBEDDED = 'com.airship.pending_embedded_updated';

function pending(embeddedId: string, instanceId: string): PendingEmbedded {
  return { embeddedId, instanceId, priority: 0, extras: {} };
}

/**
 * Builds an AirshipInApp wired to a stubbed native module, plus a `deliver`
 * that hands it a pending-embedded update the way native would.
 */
function setup() {
  const resends: number[] = [];
  let queued: PendingEmbedded[] = [];

  const native = {
    airshipListenerAdded() {},
    inAppResendPendingEmbeddedEvent() {
      resends.push(1);
    },
    takePendingEvents(eventType: string) {
      if (eventType !== PENDING_EMBEDDED) {
        return Promise.resolve([]);
      }
      const events = [{ pending: queued }];
      queued = [];
      return Promise.resolve(events);
    },
  };

  const inApp = new AirshipInApp(native, new UAEventEmitter(native));

  return {
    inApp,
    resends,
    deliver: async (entries: PendingEmbedded[]) => {
      queued = entries;
      await emit(PENDING_EVENTS);
    },
  };
}

afterEach(() => {
  reset();
});

describe('AirshipInApp', () => {
  it('asks native to resend the last embedded event on construction', () => {
    const { resends } = setup();
    expect(resends).toHaveLength(1);
  });

  it('reports nothing pending before any event arrives', () => {
    const { inApp } = setup();
    expect(inApp.getPendingEmbedded('banner')).toEqual([]);
  });

  it('groups pending content by embedded ID', async () => {
    const { inApp, deliver } = setup();

    await deliver([
      pending('banner', 'a'),
      pending('banner', 'b'),
      pending('footer', 'c'),
    ]);

    expect(inApp.getPendingEmbedded('banner').map((p) => p.instanceId)).toEqual([
      'a',
      'b',
    ]);
    expect(inApp.getPendingEmbedded('footer').map((p) => p.instanceId)).toEqual([
      'c',
    ]);
    expect(inApp.getPendingEmbedded('absent')).toEqual([]);
  });

  it('calls a new listener with what is already pending', async () => {
    const { inApp, deliver } = setup();
    await deliver([pending('banner', 'a')]);

    const seen: PendingEmbedded[][] = [];
    inApp.addPendingEmbeddedListener('banner', (p) => seen.push(p));

    expect(seen).toHaveLength(1);
    expect(seen[0]?.map((p) => p.instanceId)).toEqual(['a']);
  });

  it('notifies listeners when the pending set changes', async () => {
    const { inApp, deliver } = setup();
    const seen: PendingEmbedded[][] = [];
    inApp.addPendingEmbeddedListener('banner', (p) => seen.push(p));

    await deliver([pending('banner', 'a')]);

    expect(seen).toHaveLength(2);
    expect(seen[1]?.map((p) => p.instanceId)).toEqual(['a']);
  });

  it('reports an empty list when content for a watched ID goes away', async () => {
    const { inApp, deliver } = setup();
    await deliver([pending('banner', 'a')]);

    const seen: PendingEmbedded[][] = [];
    inApp.addPendingEmbeddedListener('banner', (p) => seen.push(p));
    await deliver([]);

    expect(seen[seen.length - 1]).toEqual([]);
  });

  it('stops notifying once the subscription is removed', async () => {
    const { inApp, deliver } = setup();
    const seen: PendingEmbedded[][] = [];
    const subscription = inApp.addPendingEmbeddedListener('banner', (p) =>
      seen.push(p)
    );

    subscription.remove();
    await deliver([pending('banner', 'a')]);

    expect(seen).toHaveLength(1);
  });

  it('reports readiness and only on a change', async () => {
    const { inApp, deliver } = setup();
    const seen: boolean[] = [];

    expect(inApp.isEmbeddedReady('banner')).toBe(false);
    inApp.addEmbeddedReadyListener('banner', (ready) => seen.push(ready));

    await deliver([pending('banner', 'a')]);
    await deliver([pending('banner', 'b')]);
    await deliver([]);

    expect(inApp.isEmbeddedReady('banner')).toBe(false);
    // false on subscribe, true once content arrives, false once it goes; the
    // second delivery is still ready, so it reports nothing.
    expect(seen).toEqual([false, true, false]);
  });

  it('passes pause and display interval through to native', async () => {
    const calls: Array<[string, unknown]> = [];
    const native = {
      airshipListenerAdded() {},
      inAppResendPendingEmbeddedEvent() {},
      takePendingEvents: () => Promise.resolve([]),
      inAppSetPaused: (v: boolean) => {
        calls.push(['setPaused', v]);
        return Promise.resolve();
      },
      inAppIsPaused: () => Promise.resolve(true),
      inAppSetDisplayInterval: (v: number) => {
        calls.push(['setDisplayInterval', v]);
        return Promise.resolve();
      },
      inAppGetDisplayInterval: () => Promise.resolve(30),
    };
    const inApp = new AirshipInApp(native, new UAEventEmitter(native));

    await inApp.setPaused(true);
    await inApp.setDisplayInterval(30);

    expect(calls).toEqual([
      ['setPaused', true],
      ['setDisplayInterval', 30],
    ]);
    await expect(inApp.isPaused()).resolves.toBe(true);
    await expect(inApp.getDisplayInterval()).resolves.toBe(30);
  });
});

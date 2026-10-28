/* Copyright Airship and Contributors */

import { afterEach, describe, expect, it } from '@jest/globals';
import {
  Platform,
  emit,
  reset,
  runHeadlessTask,
} from '../../jest/react-native';
import { UAEventEmitter } from '../UAEventEmitter';

const PENDING_EVENTS = 'com.airship.pending_events';

/**
 * A native module that hands over two events the first time a type is asked
 * for, and records which types were asked for.
 */
function fakeNativeModule() {
  const taken: string[] = [];
  const added: string[] = [];
  return {
    taken,
    added,
    airshipListenerAdded(eventType: string) {
      added.push(eventType);
    },
    takePendingEvents(eventType: string) {
      taken.push(eventType);
      return Promise.resolve([{ id: 1 }, { id: 2 }]);
    },
  };
}

afterEach(() => {
  reset();
});

describe('UAEventEmitter', () => {
  it('tells native when a listener is added', () => {
    const native = fakeNativeModule();
    const emitter = new UAEventEmitter(native);

    emitter.addListener('push', () => {});

    expect(native.added).toEqual(['push']);
  });

  it('delivers every pending event to every listener', async () => {
    const native = fakeNativeModule();
    const emitter = new UAEventEmitter(native);
    const seen: unknown[] = [];

    emitter.addListener('push', (event) => seen.push(event));
    emitter.addListener('push', (event) => seen.push(event));
    await emit(PENDING_EVENTS);

    expect(native.taken).toEqual(['push']);
    expect(seen).toHaveLength(4);
  });

  it('leaves the events in native hands once the last listener is removed', async () => {
    const native = fakeNativeModule();
    const emitter = new UAEventEmitter(native);
    const listener = () => {};

    emitter.addListener('push', listener);
    emitter.removeListener('push', listener);
    await emit(PENDING_EVENTS);

    // takePendingEvents consumes the events, so asking for a type with nothing
    // to deliver them to discards them.
    expect(native.taken).toEqual([]);
  });

  it('leaves the events in native hands after removeAllListeners', async () => {
    const native = fakeNativeModule();
    const emitter = new UAEventEmitter(native);

    emitter.addListener('push', () => {});
    emitter.removeAllListeners('push');
    await emit(PENDING_EVENTS);

    expect(native.taken).toEqual([]);
  });

  it('keeps delivering to the listeners that remain', async () => {
    const native = fakeNativeModule();
    const emitter = new UAEventEmitter(native);
    const removed = () => {};
    const seen: unknown[] = [];

    emitter.addListener('push', removed);
    emitter.addListener('push', (event) => seen.push(event));
    emitter.removeListener('push', removed);
    await emit(PENDING_EVENTS);

    expect(native.taken).toEqual(['push']);
    expect(seen).toHaveLength(2);
  });

  it('ignores removal of a type it never had', () => {
    const native = fakeNativeModule();
    const emitter = new UAEventEmitter(native);

    expect(() => emitter.removeListener('nope', () => {})).not.toThrow();
  });

  it('asks for each type that still has a listener', async () => {
    const native = fakeNativeModule();
    const emitter = new UAEventEmitter(native);

    emitter.addListener('push', () => {});
    emitter.addListener('inbox', () => {});
    await emit(PENDING_EVENTS);

    expect(native.taken.sort()).toEqual(['inbox', 'push']);
  });

  it('drains events from the Android background task', async () => {
    Platform.OS = 'android';
    const native = fakeNativeModule();
    const emitter = new UAEventEmitter(native);
    const seen: unknown[] = [];

    emitter.addListener('push', (event) => seen.push(event));
    await runHeadlessTask('AirshipAndroidBackgroundEventTask');

    expect(native.taken).toEqual(['push']);
    expect(seen).toHaveLength(2);
  });

  it('registers no background task on iOS', async () => {
    const native = fakeNativeModule();
    const emitter = new UAEventEmitter(native);

    expect(emitter).toBeDefined();
    await expect(
      runHeadlessTask('AirshipAndroidBackgroundEventTask')
    ).resolves.toBeUndefined();
  });
});

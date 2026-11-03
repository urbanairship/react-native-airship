/* Copyright Airship and Contributors */

/**
 * Stand-in for `react-native` in unit tests, mapped in by `jest.config.js`.
 *
 * Only the surface the SDK touches is implemented. `emit` delivers an event to
 * whatever the SDK registered for it, so a test can drive the native side
 * without a device.
 */

type Listener = (...args: any[]) => any;

const listeners = new Map<string, Listener>();
const headlessTasks = new Map<string, () => Listener>();

export class NativeEventEmitter {
  constructor(_nativeModule?: unknown) {}

  addListener(eventType: string, listener: Listener) {
    listeners.set(eventType, listener);
    return {
      remove: () => {
        listeners.delete(eventType);
      },
    };
  }
}

export const Platform: { OS: 'ios' | 'android' } = { OS: 'ios' };

export const AppRegistry = {
  registerHeadlessTask(name: string, taskProvider: () => Listener) {
    headlessTasks.set(name, taskProvider);
  },
};

/**
 * Delivers a native event to the listener the SDK registered for it.
 *
 * @param eventType The native event name.
 * @param args Arguments to pass to the listener.
 * @returns What the listener returned, so a test can await its work.
 */
export function emit(eventType: string, ...args: any[]): Promise<unknown> {
  return Promise.resolve(listeners.get(eventType)?.(...args));
}

/**
 * Runs a headless task registered through `AppRegistry`.
 *
 * @param name The task name.
 * @returns What the task returned, so a test can await its work.
 */
export function runHeadlessTask(name: string): Promise<unknown> {
  const provider = headlessTasks.get(name);
  return Promise.resolve(provider ? provider()() : undefined);
}

/**
 * Clears registrations between tests.
 */
export function reset(): void {
  listeners.clear();
  headlessTasks.clear();
  Platform.OS = 'ios';
}

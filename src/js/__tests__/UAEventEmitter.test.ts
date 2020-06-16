/* Copyright Airship and Contributors */

import { EmitterSubscription } from 'react-native';
import { UAEventEmitter } from '../UAEventEmitter';

class MockEventEmitter {
    constructor() { }
    listeners(eventType: string) { return [] }
    addListener(eventType: string, listener: (...args: any[]) => any, context?: Object | null | undefined) { }
    removeAllListeners(eventType?: string) { }
    removeSubscription(subscription: EmitterSubscription) { }
}

class MockNativeEventEmitter extends MockEventEmitter { }

interface MockNativeModule {
    addAndroidListener: jest.Mock<any, any>,
    removeAndroidListeners: jest.Mock<any, any>,
    removeAllAndroidListeners: jest.Mock<any, any>
}

describe("UAEventEmitter Tests", () => {
    var emitter: UAEventEmitter;
    var MockUrbanairshipModule: MockNativeModule
    var MockPlatform: { OS: string };

    beforeEach(() => {
        // Stub out the relevant native modules
        MockUrbanairshipModule = {
            addAndroidListener: jest.fn(),
            removeAndroidListeners: jest.fn(),
            removeAllAndroidListeners: jest.fn()
        }

        MockPlatform = {
            OS: "test"
        };

        jest.resetModules();

        // Mock the react-native imports used by UAEventEmitter
        jest.mock('react-native', () => ({
            Platform: MockPlatform,
            NativeEventEmitter: MockNativeEventEmitter,
            NativeModules: {
                UrbanAirshipReactModule: MockUrbanairshipModule
            }
        }));

        // Spy on super calls for later verification
        jest.spyOn(MockNativeEventEmitter.prototype, 'addListener');
        jest.spyOn(MockNativeEventEmitter.prototype, 'removeAllListeners');
        jest.spyOn(MockNativeEventEmitter.prototype, 'removeSubscription');

        const UAEventEmitter = require("../UAEventEmitter");
        emitter = new UAEventEmitter.UAEventEmitter();
    });

    afterEach(() => {
        // Reset global event state
        emitter.removeAllListeners();
    });

    test('addListenerAndroid', () => {
        MockPlatform.OS = 'android';

        var listener = () => { };
        var context = { "cool": "rad" };

        emitter.addListener("foo", listener, context);

        expect(MockUrbanairshipModule.addAndroidListener).toHaveBeenCalledWith("foo");
        expect(MockNativeEventEmitter.prototype.addListener).toHaveBeenCalledWith("foo", listener, context);
    });

    test('addListeneriOS', () => {
        MockPlatform.OS = 'ios';

        var listener = () => { };
        var context = { "cool": "rad" };
        ;
        emitter.addListener("foo", listener, context);

        expect(MockUrbanairshipModule.addAndroidListener).not.toHaveBeenCalled();
        expect(MockNativeEventEmitter.prototype.addListener).toHaveBeenCalledWith("foo", listener, context);
    });

    test('removeAllListenersAndroid', () => {
        MockPlatform.OS = 'android';

        MockNativeEventEmitter.prototype.listeners = jest.fn().mockImplementation((eventType) => {
            return [() => { }, () => { }];
        });

        emitter.removeAllListeners("foo");

        expect(MockUrbanairshipModule.removeAndroidListeners).toHaveBeenCalledWith(2);
        expect(MockNativeEventEmitter.prototype.removeAllListeners).toHaveBeenCalledWith("foo");
    });

    test('removeAllListenersiOS', () => {
        MockPlatform.OS = 'ios';

        emitter.removeAllListeners("foo");

        expect(MockUrbanairshipModule.removeAndroidListeners).not.toHaveBeenCalled();
        expect(MockNativeEventEmitter.prototype.removeAllListeners).toHaveBeenCalledWith("foo");
    });
    test('removeSubscriptionAndroid', () => {
        MockPlatform.OS = 'android';

        const subscription = emitter.addListener("foo", () => { })
        emitter.removeSubscription(subscription);

        expect(MockUrbanairshipModule.removeAndroidListeners).toHaveBeenCalledWith(1);
        expect(MockNativeEventEmitter.prototype.removeSubscription).toHaveBeenCalledWith(subscription);
    });

    test('removeSubscriptioniOS', () => {
        MockPlatform.OS = 'ios';

        const subscription = emitter.addListener("foo", () => { })
        emitter.removeSubscription(subscription);

        expect(MockUrbanairshipModule.removeAndroidListeners).not.toHaveBeenCalled();
        expect(MockNativeEventEmitter.prototype.removeSubscription).toHaveBeenCalledWith(subscription);
    });
});

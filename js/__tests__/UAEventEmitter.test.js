/* Copyright Airship and Contributors */

const EventEmitter = require("EventEmitter");
const RCTDeviceEventEmitter = require('RCTDeviceEventEmitter');

/**
 * Redefine the NativeEventEmitter as a regular old EventEmitter for testing
 *
 * Note: The Mock prefix here is semantically significant, and tells jest that test variables
 * may be lazily bound to this object within their local scope.
 */
class MockNativeEventEmitter extends EventEmitter {
    constructor() {
      super(RCTDeviceEventEmitter.sharedSubscriber);
    }
}

describe("UAEventEmitter Tests", () => {
    var UAEventEmitter;
    var MockPlatform;
    var MockUrbanairshipModule;
    var MockNativeModules;
    var emitter;

    beforeEach(() => {
        jest.resetModules();

        // Stub out the relevant native modules
        MockUrbanairshipModule = {
            addAndroidListener : jest.fn(),
            removeAndroidListeners : jest.fn()
        }

        MockNativeModules = {
            UrbanAirshipReactModule : MockUrbanairshipModule
        };

        MockPlatform = {};

        // Mock the react-native imports used by UAEventEmitter
        jest.mock('react-native', () => ({
            Platform : MockPlatform,
            NativeEventEmitter: MockNativeEventEmitter,
            NativeModules : MockNativeModules
        }));

        // Spy on super calls for later verification
        jest.spyOn(MockNativeEventEmitter.prototype, 'addListener');
        jest.spyOn(MockNativeEventEmitter.prototype, 'removeAllListeners');
        jest.spyOn(MockNativeEventEmitter.prototype, 'removeSubscription');

        // Load and instantiate the class
        UAEventEmitter = require("../UAEventEmitter");
        emitter = new UAEventEmitter();
    });

    afterEach(() => {
        // Reset global event state
        emitter.removeAllListeners();
    })

    test('addListenerAndroid', () => {
        MockPlatform.OS = 'android';

        var listener = () => {};
        var context = {"cool" : "rad"};
;
        emitter.addListener("foo", listener, context);

        expect(MockUrbanairshipModule.addAndroidListener).toHaveBeenCalledWith("foo");
        expect(MockNativeEventEmitter.prototype.addListener).toHaveBeenCalledWith("foo", listener, context);
    });

    test('addListeneriOS', () => {
        MockPlatform.OS = 'ios';

        var listener = () => {};
        var context = {"cool" : "rad"};
;
        emitter.addListener("foo", listener, context);

        expect(MockUrbanairshipModule.addAndroidListener).not.toHaveBeenCalled();
        expect(MockNativeEventEmitter.prototype.addListener).toHaveBeenCalledWith("foo", listener, context);
    });

    test('removeAllListenersAndroid', () => {
        MockPlatform.OS = 'android';

        emitter.addListener("foo", () => {}, {"cool" : "rad"});
        emitter.addListener("foo", () => {}, {"such" : "as"});

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

        var subcription = emitter.addListener("foo", () => {}, {"cool" : "rad"});

        emitter.removeSubscription(subcription);

        expect(MockUrbanairshipModule.removeAndroidListeners).toHaveBeenCalledWith(1);
        expect(MockNativeEventEmitter.prototype.removeSubscription).toHaveBeenCalledWith(subcription);
    });

    test('removeSubscriptioniOS', () => {
        MockPlatform.OS = 'ios';

        var subcription = emitter.addListener("foo", () => {}, {"cool" : "rad"});

        emitter.removeSubscription(subcription);

        expect(MockUrbanairshipModule.removeAndroidListeners).not.toHaveBeenCalled();
        expect(MockNativeEventEmitter.prototype.removeSubscription).toHaveBeenCalledWith(subcription);
    });
});

/* Copyright Airship and Contributors */

import { UAEventEmitter, AirshipEventBridge, DispatchEventsCallback } from '../UAEventEmitter';

class TestAirshipEventBridge extends AirshipEventBridge {
    notifyAirshipListenerAdded = jest.fn();
}

describe("UAEventEmitter Tests", () => {
    var airshipEventEmitter: UAEventEmitter;
    var airshipEventBridge: AirshipEventBridge;

    beforeEach(() => {
        airshipEventEmitter = new UAEventEmitter((callback: DispatchEventsCallback) => {
            airshipEventBridge = new TestAirshipEventBridge(callback);
            return airshipEventBridge;
        });
    });

    test('addListener', () => {
        var listener = () => { };
        airshipEventEmitter.addListener("foo", listener);
        expect(airshipEventBridge.notifyAirshipListenerAdded).toHaveBeenCalled();
    });

    test('dispatchEvents', async () => {
        var event = { "neat": "story" };
        var mockListener = jest.fn();

        airshipEventEmitter.addListener("foo", mockListener);

        var mockSource = jest.fn();
        mockSource.mockReturnValue(Promise.resolve([event]));

        await airshipEventBridge.dispatchEventsCallback(mockSource);

        expect(mockSource).toHaveBeenCalledWith("foo");
        expect(mockListener).toHaveBeenCalledWith(event);
    });
});

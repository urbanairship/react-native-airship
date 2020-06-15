/* Copyright Airship and Contributors */

const UACustomEvent =  require('../UACustomEvent')

describe("UACustomEvent Tests", () => {

    test('UACustomEvent', () => {
        var event = new UACustomEvent("customevent", 123);

        expect(event._name).toEqual("customevent");
        expect(event._value).toEqual(123);
        expect(event._properties).toEqual({});
        expect(event.transactionId).toBeUndefined();
    });

    test('addProperty', () => {
        var event = new UACustomEvent("customevent", 123);

        event.addProperty("oh", "hi");
        event.addProperty("foo", 123);
        event.addProperty("bar", true);
        event.addProperty("json", { "test": 1 });

        expect(event._properties).toEqual({
            "oh" : "hi",
            "foo" : 123,
            "bar" : true,
            "json" : { "test": 1 }
        });
    });

    test('transactionId', () => {
        var event = new UACustomEvent("customevent", 123);
        event.transactionId = "transactionId";
        expect(event.transactionId).toEqual("transactionId");
    });
});

/* Copyright Airship and Contributors */

import { TagGroupEditor } from "../TagGroupEditor";

describe("TagGroupEditor Tests", () => {

    test('addTags', () => {
        new TagGroupEditor((operations) => {
            expect(operations).toEqual([{
                "group": "testGroup",
                "operationType": "add",
                "tags": ["oh", "hi"]
            }]);
        }).addTags("testGroup", ["oh", "hi"]).apply();
    });

    test('removeTags', () => {
        new TagGroupEditor((operations) => {
            expect(operations).toEqual([{
                "group": "testGroup",
                "operationType": "remove",
                "tags": ["foo", "bar"]
            }]);
        }).removeTags("testGroup", ["foo", "bar"]).apply();
    });

    test('setTags', () => {
        new TagGroupEditor((operations) => {
            expect(operations).toEqual([{
                "group": "testGroup",
                "operationType": "set",
                "tags": ["baz", "boz"]
            }]);
        }).setTags("testGroup", ["baz", "boz"]).apply();
    });

    test('apply', () => {
        var applied = false;
        new TagGroupEditor(() => {
            applied = true;
        }).apply();

        expect(applied).toEqual(true);
    });
});

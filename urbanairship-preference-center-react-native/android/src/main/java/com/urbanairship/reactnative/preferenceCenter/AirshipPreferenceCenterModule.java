/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative.preferenceCenter;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import android.preference.PreferenceManager;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.module.annotations.ReactModule;
import com.urbanairship.PendingResult;
import com.urbanairship.ResultCallback;
import com.urbanairship.preferencecenter.PreferenceCenter;
import com.urbanairship.UAirship;
import com.urbanairship.preferencecenter.data.CommonDisplay;
import com.urbanairship.preferencecenter.data.Item;
import com.urbanairship.preferencecenter.data.PreferenceCenterConfig;
import com.urbanairship.preferencecenter.data.Section;
import com.urbanairship.reactnative.Event;
import com.urbanairship.reactnative.EventEmitter;
import com.urbanairship.reactnative.preferenceCenter.events.OpenPreferenceCenterEvent;

import java.util.List;

@ReactModule(name = AirshipPreferenceCenterModule.NAME)
public class AirshipPreferenceCenterModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;
    public static final String NAME = "AirshipPreferenceCenterModule";

    public AirshipPreferenceCenterModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        PreferenceCenter.shared().setOpenListener(new PreferenceCenter.OnOpenListener() {
            @Override
            public boolean onOpenPreferenceCenter(String preferenceCenterId) {
                if (isCustomPreferenceCenterUiEnabled(preferenceCenterId)) {
                    Event event = new OpenPreferenceCenterEvent(preferenceCenterId);
                    EventEmitter.shared().sendEvent(event);
                    return true;
                } else {
                    return false;
                }
            }
        });
    }

    @Override
    @NonNull
    public String getName() {
        return NAME;
    }

    private boolean isCustomPreferenceCenterUiEnabled(String preferenceCenterId) {
        return PreferenceManager.getDefaultSharedPreferences(UAirship.getApplicationContext())
                .getBoolean(preferenceCenterId, false);
    }

    @ReactMethod
    public void open(String preferenceCenterId) {
        PreferenceCenter.shared().open(preferenceCenterId);
    }

    @ReactMethod
    public void getConfiguration(String preferenceCenterId, final Promise promise) {

        PreferenceCenter.shared().getConfig(preferenceCenterId).addResultCallback(new ResultCallback<PreferenceCenterConfig>() {
            @Override
            public void onResult(@Nullable PreferenceCenterConfig configPendingResult) {

                WritableMap configMap = new WritableNativeMap();
                if (configPendingResult != null) {
                    configMap.putString("id", configPendingResult.getId());

                    List<Section> sections = configPendingResult.getSections();
                    if (sections != null) {
                        WritableArray sectionArray = Arguments.createArray();
                        for (Section section : sections) {
                            WritableMap sectionMap = new WritableNativeMap();
                            sectionMap.putString("id", section.getId());

                            List<Item> items = section.getItems();
                            if (items != null) {
                                WritableArray itemArray = Arguments.createArray();
                                for (Item item : items) {
                                    WritableMap itemMap = new WritableNativeMap();
                                    itemMap.putString("id", item.getId());
                                    if (item instanceof Item.ChannelSubscription) {
                                        Item.ChannelSubscription subscription = (Item.ChannelSubscription) item;
                                        itemMap.putString("subscriptionId", subscription.getSubscriptionId());
                                    }

                                    CommonDisplay commonDisplay = item.getDisplay();
                                    if (commonDisplay != null) {
                                        WritableMap commonDisplayMap = new WritableNativeMap();
                                        commonDisplayMap.putString("name", commonDisplay.getName());
                                        commonDisplayMap.putString("description", commonDisplay.getDescription());
                                        itemMap.putMap("display", (ReadableMap) commonDisplayMap);
                                    }
                                    itemArray.pushMap(itemMap);
                                }
                                sectionMap.putArray("item", itemArray);
                            }

                            CommonDisplay sectionCommonDisplay = section.getDisplay();
                            WritableMap sectionCommonDisplayMap = new WritableNativeMap();
                            if (sectionCommonDisplay != null) {
                                sectionCommonDisplayMap.putString("name", sectionCommonDisplay.getName());
                                sectionCommonDisplayMap.putString("description", sectionCommonDisplay.getDescription());
                                sectionMap.putMap("display", (ReadableMap) sectionCommonDisplayMap);
                            }

                            sectionArray.pushMap(sectionMap);
                        }
                        configMap.putArray("sections", sectionArray);
                    }

                    CommonDisplay configCommonDisplay = configPendingResult.getDisplay();
                    WritableMap configCommonDisplayMap = new WritableNativeMap();
                    if (configCommonDisplay != null) {
                        configCommonDisplayMap.putString("name", configCommonDisplay.getName());
                        configCommonDisplayMap.putString("description", configCommonDisplay.getDescription());
                        configMap.putMap("display", (ReadableMap) configCommonDisplayMap);
                    }
                }

                promise.resolve(configMap);
            }
        });
    }

    @ReactMethod
    public void setUseCustomPreferenceCenterUi(boolean useCustomUI, String preferenceID) {
      PreferenceManager.getDefaultSharedPreferences(UAirship.getApplicationContext()).edit().putBoolean(preferenceID, useCustomUI).apply();
    }

}

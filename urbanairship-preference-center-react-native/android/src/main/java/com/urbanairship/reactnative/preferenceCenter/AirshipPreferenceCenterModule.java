/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative.preferenceCenter;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import android.annotation.SuppressLint;
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
import com.urbanairship.Cancelable;
import com.urbanairship.PendingResult;
import com.urbanairship.ResultCallback;
import com.urbanairship.json.JsonList;
import com.urbanairship.json.JsonMap;
import com.urbanairship.json.JsonValue;
import com.urbanairship.preferencecenter.PreferenceCenter;
import com.urbanairship.UAirship;
import com.urbanairship.preferencecenter.data.CommonDisplay;
import com.urbanairship.preferencecenter.data.Item;
import com.urbanairship.preferencecenter.data.PreferenceCenterConfig;
import com.urbanairship.preferencecenter.data.Section;
import com.urbanairship.reactive.Observable;
import com.urbanairship.reactive.Observer;
import com.urbanairship.reactive.Subscriber;
import com.urbanairship.reactive.Subscription;
import com.urbanairship.reactnative.Event;
import com.urbanairship.reactnative.EventEmitter;
import com.urbanairship.reactnative.Utils;
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
        getConfigJson(preferenceCenterId).addResultCallback(result -> {
            if (result == null) {
                promise.reject(new Exception("Failed to get preference center configuration."));
                return;
            }

            promise.resolve(Utils.convertJsonValue(result));
        });
    }

    @ReactMethod
    public void setUseCustomPreferenceCenterUi(boolean useCustomUI, String preferenceID) {
      PreferenceManager.getDefaultSharedPreferences(UAirship.getApplicationContext()).edit().putBoolean(preferenceID, useCustomUI).apply();
    }

    @SuppressLint("RestrictedApi")
    private PendingResult<JsonValue> getConfigJson(final String prefCenterId) {
        PendingResult<JsonValue> result = new PendingResult<>();

        UAirship.shared().getRemoteData().payloadsForType("preference_forms")
                .flatMap((payload) -> {
                    JsonList forms = payload.getData().opt("preference_forms").optList();
                    for (JsonValue formJson : forms) {
                        JsonMap formMap = formJson.optMap().opt("form").optMap();
                        if (formMap.opt("id").optString().equals(prefCenterId)) {
                            return Observable.just(formMap.toJsonValue());
                        }
                    }
                    return Observable.empty();
                }).distinctUntilChanged()
                .subscribe(new Subscriber<JsonValue>() {
                    @Override
                    public void onNext(@NonNull JsonValue value) {
                        result.setResult(value);
                    }

                    @Override
                    public void onError(@NonNull Exception e) {
                        result.setResult(null);
                    }
                });
        return result;
    }
}

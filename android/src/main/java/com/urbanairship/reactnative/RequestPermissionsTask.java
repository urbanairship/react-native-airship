/* Copyright 2017 Urban Airship and Contributors */

package com.urbanairship.reactnative;

import android.content.Context;
import android.content.pm.PackageManager;
import android.os.AsyncTask;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;

import com.urbanairship.util.HelperActivity;


/**
 * Async task to request permissions.
 */
class RequestPermissionsTask extends AsyncTask<String, Void, Boolean> {

    private final Context context;
    private Callback callback;

    /**
     * Callback when with the result.
     */
    public interface Callback {
        void onResult(boolean enabled);
    }

    /**
     * Creates a request permissions task.
     * @param context The application context.
     * @param callback The callback.
     */
    RequestPermissionsTask(@NonNull Context context, @Nullable Callback callback) {
        this.context = context;
        this.callback = callback;
    }

    @Override
    protected Boolean doInBackground(String... strings) {
        int[] result = HelperActivity.requestPermissions(context, strings);
        for (int element : result) {
            if (element == PackageManager.PERMISSION_GRANTED) {
                return true;
            }
        }

        return false;
    }

    @Override
    protected void onPostExecute(Boolean result) {
        if (callback != null) {
            callback.onResult(result);
        }
    }
}

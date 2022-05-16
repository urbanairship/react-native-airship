/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative

import android.util.Log
import androidx.annotation.RestrictTo
import com.urbanairship.util.UAStringUtil
import java.util.*

/**
 * Plugin logger
 */
object PluginLogger {

    private const val TAG = "UALib-ReactNative"

    /**
     * The current log level, as defined by `android.util.Log`.
     * Defaults to `android.util.Log.ERROR`.
     */
    private var logLevel = Log.INFO

    /**
     * Sets the log level.
     *
     * @param logLevel The log level.
     */
    @RestrictTo(RestrictTo.Scope.LIBRARY_GROUP)
    @JvmStatic
    fun setLogLevel(logLevel: Int) {
        this.logLevel = logLevel
    }

    /**
     * Send a warning log message.
     *
     * @param message The message you would like logged.
     * @param args The message args.
     */
    @RestrictTo(RestrictTo.Scope.LIBRARY_GROUP)
    @JvmStatic
    fun warn(message: String, vararg args: Any?) {
        log(Log.WARN, null, message, *args)
    }

    /**
     * Send a warning log message.
     *
     * @param t An exception to log
     * @param message The message you would like logged.
     * @param args The message args.
     */
    @RestrictTo(RestrictTo.Scope.LIBRARY_GROUP)
    @JvmStatic
    fun warn(t: Throwable, message: String, vararg args: Any?) {
        log(Log.WARN, t, message, *args)
    }

    /**
     * Send a warning log message.
     *
     * @param t An exception to log
     */
    @RestrictTo(RestrictTo.Scope.LIBRARY_GROUP)
    @JvmStatic
    fun warn(t: Throwable) {
        log(Log.WARN, t, null)
    }

    /**
     * Send a verbose log message.
     *
     * @param message The message you would like logged.
     * @param args The message args.
     */
    @RestrictTo(RestrictTo.Scope.LIBRARY_GROUP)
    @JvmStatic
    fun verbose(message: String, vararg args: Any?) {
        log(Log.VERBOSE, null, message, *args)
    }

    /**
     * Send a debug log message.
     *
     * @param message The message you would like logged.
     * @param args The message args.
     */
    @RestrictTo(RestrictTo.Scope.LIBRARY_GROUP)
    @JvmStatic
    fun debug(message: String, vararg args: Any?) {
        log(Log.DEBUG, null, message, *args)
    }

    /**
     * Send a debug log message.
     *
     * @param t An exception to log
     * @param message The message you would like logged.
     * @param args The message args.
     */
    @RestrictTo(RestrictTo.Scope.LIBRARY_GROUP)
    @JvmStatic
    fun debug(t: Throwable, message: String, vararg args: Any?) {
        log(Log.DEBUG, t, message, *args)
    }

    /**
     * Send an info log message.
     *
     * @param message The message you would like logged.
     * @param args The message args.
     */
    @RestrictTo(RestrictTo.Scope.LIBRARY_GROUP)
    @JvmStatic
    fun info(message: String, vararg args: Any) {
        log(Log.INFO, null, message, *args)
    }

    /**
     * Send an info log message.
     *
     * @param t An exception to log
     * @param message The message you would like logged.
     * @param args The message args.
     */
    @RestrictTo(RestrictTo.Scope.LIBRARY_GROUP)
    @JvmStatic
    fun info(t: Throwable, message: String, vararg args: Any?) {
        log(Log.INFO, t, message, *args)
    }

    /**
     * Send an error log message.
     *
     * @param message The message you would like logged.
     * @param args The message args.
     */
    @RestrictTo(RestrictTo.Scope.LIBRARY_GROUP)
    @JvmStatic
    fun error(message: String, vararg args: Any?) {
        log(Log.ERROR, null, message, *args)
    }

    /**
     * Send an error log message.
     *
     * @param t An exception to log
     */
    @RestrictTo(RestrictTo.Scope.LIBRARY_GROUP)
    @JvmStatic
    fun error(t: Throwable) {
        log(Log.ERROR, t, null)
    }

    /**
     * Send an error log message.
     *
     * @param t An exception to log
     * @param message The message you would like logged.
     * @param args The message args.
     */
    @RestrictTo(RestrictTo.Scope.LIBRARY_GROUP)
    @JvmStatic
    fun error(t: Throwable, message: String, vararg args: Any?) {
        log(Log.ERROR, t, message, *args)
    }

    /**
     * Helper method that performs the logging.
     *
     * @param priority The log priority level.
     * @param throwable The optional exception.
     * @param message The optional message.
     * @param args The optional message args.
     */
    private fun log(priority: Int, throwable: Throwable?, message: String?, vararg args: Any?) {
        if (logLevel > priority) {
            return
        }

        if (message == null && throwable == null) {
            return
        }

        val formattedMessage: String? = if (UAStringUtil.isEmpty(message)) {
            // Default to empty string
            ""
        } else {
            // Format the message if we have arguments
            try {
                if (args.isEmpty()) {
                    message
                } else {
                    String.format(Locale.ROOT, message!!, *args)
                }
            } catch (e: Exception) {
                Log.wtf(TAG, "Failed to format log.", e)
                return
            }
        }

        // Log directly if we do not have a throwable
        if (throwable == null) {
            if (priority == Log.ASSERT) {
                Log.wtf(TAG, formattedMessage)
            } else {
                Log.println(priority, TAG, formattedMessage!!)
            }
            return
        }
        when (priority) {
            Log.INFO -> Log.i(TAG, formattedMessage, throwable)
            Log.DEBUG -> Log.d(TAG, formattedMessage, throwable)
            Log.VERBOSE -> Log.v(TAG, formattedMessage, throwable)
            Log.WARN -> Log.w(TAG, formattedMessage, throwable)
            Log.ERROR -> Log.e(TAG, formattedMessage, throwable)
            Log.ASSERT -> Log.wtf(TAG, formattedMessage, throwable)
        }
    }
}
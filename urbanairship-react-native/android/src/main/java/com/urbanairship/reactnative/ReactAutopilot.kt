/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative

import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.net.Uri
import android.util.Log
import androidx.annotation.XmlRes
import com.urbanairship.AirshipConfigOptions
import com.urbanairship.Autopilot
import com.urbanairship.Logger
import com.urbanairship.PrivacyManager
import com.urbanairship.UAirship
import com.urbanairship.actions.DeepLinkListener
import com.urbanairship.analytics.Analytics
import com.urbanairship.channel.AirshipChannelListener
import com.urbanairship.json.JsonList
import com.urbanairship.json.JsonMap
import com.urbanairship.json.JsonValue
import com.urbanairship.messagecenter.MessageCenter
import com.urbanairship.preferencecenter.PreferenceCenter
import com.urbanairship.push.NotificationActionButtonInfo
import com.urbanairship.push.NotificationInfo
import com.urbanairship.push.NotificationListener
import com.urbanairship.reactnative.Utils.getHexColor
import com.urbanairship.reactnative.Utils.getNamedResource
import com.urbanairship.reactnative.Utils.parseFeature
import com.urbanairship.reactnative.events.*
import com.urbanairship.reactnative.preferenceCenter.events.DisplayPreferenceCenterEvent

/**
 * Module's autopilot to customize Urban Airship.
 */
class ReactAutopilot : Autopilot() {

    private var configOptions: AirshipConfigOptions? = null

    override fun onAirshipReady(airship: UAirship) {
        super.onAirshipReady(airship)

        PluginLogger.setLogLevel(airship.airshipConfigOptions.logLevel)

        PluginLogger.debug("Airship React Native version: %s, SDK version: %s", BuildConfig.MODULE_VERSION, UAirship.getVersion())

        val context = UAirship.getApplicationContext()

        airship.deepLinkListener = DeepLinkListener { deepLink ->
            val event: Event = DeepLinkEvent(deepLink)
            EventEmitter.shared().sendEvent(event)
            true
        }

        airship.pushManager.addPushListener { pushMessage, notificationPosted ->
            if (!notificationPosted) {
                val event: Event = PushReceivedEvent(pushMessage)
                EventEmitter.shared().sendEvent(event)
            }
        }

        airship.channel.addChannelListener(object : AirshipChannelListener {
            override fun onChannelCreated(channelId: String) {
                val event: Event = ChannelCreatedEvent(channelId, UAirship.shared().pushManager.pushToken)
                EventEmitter.shared().sendEvent(event)
            }

            override fun onChannelUpdated(channelId: String) {
            }
        })

        airship.pushManager.addPushTokenListener { token ->
            val event = PushTokenReceivedEvent(token)
            EventEmitter.shared().sendEvent(event)
        }

        airship.pushManager.notificationListener = object : NotificationListener {
            override fun onNotificationPosted(notificationInfo: NotificationInfo) {
                val event: Event = PushReceivedEvent(notificationInfo)
                EventEmitter.shared().sendEvent(event)
            }

            override fun onNotificationOpened(notificationInfo: NotificationInfo): Boolean {
                val event: Event = NotificationResponseEvent(notificationInfo, null)
                EventEmitter.shared().sendEvent(event)
                return false
            }

            override fun onNotificationForegroundAction(notificationInfo: NotificationInfo, notificationActionButtonInfo: NotificationActionButtonInfo): Boolean {
                val event: Event = NotificationResponseEvent(notificationInfo, notificationActionButtonInfo)
                EventEmitter.shared().sendEvent(event)
                return false
            }

            override fun onNotificationBackgroundAction(notificationInfo: NotificationInfo, notificationActionButtonInfo: NotificationActionButtonInfo) {
                val event: Event = NotificationResponseEvent(notificationInfo, notificationActionButtonInfo)
                EventEmitter.shared().sendEvent(event)
            }

            override fun onNotificationDismissed(notificationInfo: NotificationInfo) {}
        }

        // Register a listener for inbox update event
        MessageCenter.shared().inbox.addListener {
            val event: Event = MessageCenterUpdatedEvent(MessageCenter.shared().inbox.unreadCount, MessageCenter.shared().inbox.count)
            EventEmitter.shared().sendEvent(event)
        }

        val preferences = ReactAirshipPreferences.shared(context)
        MessageCenter.shared().setOnShowMessageCenterListener { messageId ->
            if (preferences.isAutoLaunchMessageCenterEnabled) {
                false
            } else {
                sendShowInboxEvent(messageId)
                true
            }
        }

        PreferenceCenter.shared().openListener =
            PreferenceCenter.OnOpenListener { preferenceCenterId: String ->
                if (preferences.isAutoLaunchPreferenceCenterEnabled(preferenceCenterId)) {
                    return@OnOpenListener false
                } else {
                    val event: Event = DisplayPreferenceCenterEvent(preferenceCenterId)
                    EventEmitter.shared().sendEvent(event)
                    return@OnOpenListener true
                }
            }

        // Set our custom notification provider
        val notificationProvider = ReactNotificationProvider(context, airship.airshipConfigOptions)
        airship.pushManager.notificationProvider = notificationProvider

        airship.analytics.registerSDKExtension(Analytics.EXTENSION_REACT_NATIVE, BuildConfig.MODULE_VERSION)

        loadCustomNotificationChannels(context, airship)
        loadCustomNotificationButtonGroups(context, airship)

        val extender = createExtender(context)
        extender?.onAirshipReady(context, airship)
    }

    private fun loadCustomNotificationChannels(context: Context, airship: UAirship) {
        val packageName = UAirship.getPackageName()
        @XmlRes val resId = context.resources.getIdentifier("ua_custom_notification_channels", "xml", packageName)

        if (resId != 0) {
            PluginLogger.debug("Loading custom notification channels")
            airship.pushManager.notificationChannelRegistry.createNotificationChannels(resId)
        }
    }

    private fun loadCustomNotificationButtonGroups(context: Context, airship: UAirship) {
        val packageName = UAirship.getPackageName()
        @XmlRes val resId = context.resources.getIdentifier("ua_custom_notification_buttons", "xml", packageName)

        if (resId != 0) {
            PluginLogger.debug("Loading custom notification button groups")
            airship.pushManager.addNotificationActionButtonGroups(context, resId)
        }
    }

    override fun isReady(context: Context): Boolean {
        configOptions = loadConfig(context)

        return try {
            configOptions!!.validate()
            true
        } catch (e: Exception) {
            false
        }
    }

    override fun createAirshipConfigOptions(context: Context): AirshipConfigOptions? {
        return configOptions
    }

    @SuppressLint("RestrictedApi")
    private fun loadConfig(context: Context): AirshipConfigOptions {
        Logger.setLogLevel(Log.ASSERT)
        val builder = AirshipConfigOptions.newBuilder()
            .applyDefaultProperties(context)
            .setRequireInitialRemoteConfigEnabled(true)

        Logger.setLogLevel(Log.ERROR)

        val config: JsonMap? = ReactAirshipPreferences.shared(context).airshipConfig
        if (config == null || config.isEmpty) {
            return builder.build()
        }

        val developmentEnvironment = config.opt("development").map
        val productionEnvironment = config.opt("production").map
        val defaultEnvironment = config.opt("default").map

        developmentEnvironment?.let {
            builder.setDevelopmentAppKey(it.opt("appKey").string)
                .setDevelopmentAppSecret(it.opt("appSecret").string)
            val logLevel = it.opt("logLevel").string
            logLevel?.let { logLvl ->
                builder.setLogLevel(convertLogLevel(logLvl, Log.DEBUG))
            }
        }

        productionEnvironment?.let {
            builder.setProductionAppKey(it.opt("appKey").string)
                .setProductionAppSecret(it.opt("appSecret").string)
            val logLevel = it.opt("logLevel").string
            logLevel?.let { logLvl ->
                builder.setProductionLogLevel(convertLogLevel(logLvl, Log.ERROR))
            }
        }

        defaultEnvironment?.let {
            builder.setAppKey(it.opt("appKey").string)
                .setAppSecret(it.opt("appSecret").string)
            val logLevel = it.opt("logLevel").string
            logLevel?.let { logLvl ->
                builder.setLogLevel(convertLogLevel(logLvl, Log.ERROR))
            }
        }

        val site = config.opt("site").string
        site?.let {
            try {
                builder.setSite(parseSite(it))
            } catch (e: Exception) {
                PluginLogger.error("Invalid site $it", e)
            }
        }

        if (config.containsKey("inProduction")) {
            builder.setInProduction(config.opt("inProduction").getBoolean(false))
        }

        if (config.containsKey("isChannelCreationDelayEnabled")) {
            builder.setChannelCreationDelayEnabled(
                config.opt("isChannelCreationDelayEnabled").getBoolean(false)
            )
        }

        val initialConfigUrl = config.opt("initialConfigUrl").string
        initialConfigUrl?.let {
            try {
                builder.setInitialConfigUrl(initialConfigUrl)
            } catch (e: Exception) {
                PluginLogger.error("Invalid initialConfigUrl $it", e)
            }
        }

        val urlAllowList = parseArray(config.opt("urlAllowList"))
        urlAllowList?.let {
            builder.setUrlAllowList(it)
        }

        val urlAllowListScopeJavaScriptInterface = parseArray(config.opt("urlAllowListScopeJavaScriptInterface"))
        urlAllowListScopeJavaScriptInterface?.let {
            builder.setUrlAllowListScopeJavaScriptInterface(it)
        }

        val urlAllowListScopeOpenUrl = parseArray(config.opt("urlAllowListScopeOpenUrl"))
        urlAllowListScopeOpenUrl?.let {
            builder.setUrlAllowListScopeOpenUrl(it)
        }

        val chat = config.opt("chat").map
        chat?.let {
            builder.setChatSocketUrl(it.opt("webSocketUrl").optString())
                .setChatUrl(it.opt("url").optString())
        }

        val android = config.opt("android").map
        android?.let {
            if (it.containsKey("appStoreUri")) {
                builder.setAppStoreUri(Uri.parse(it.opt("appStoreUri").optString()))
            }

            if (it.containsKey("fcmFirebaseAppName")) {
                builder.setFcmFirebaseAppName(it.opt("fcmFirebaseAppName").optString())
            }

            if (it.containsKey("notificationConfig")) {
                applyNotificationConfig(context, it.opt("notificationConfig").optMap(), builder)
            }
        }

        val enabledFeatures = config.opt("enabledFeatures").list
        try {
            enabledFeatures?.let {
                builder.setEnabledFeatures(parseFeatures(it))
            }
        } catch (e: Exception) {
            PluginLogger.error("Invalid enabled features: $enabledFeatures")
        }
        return builder.build()
    }

    private fun applyNotificationConfig(context: Context, notificationConfig: JsonMap, builder: AirshipConfigOptions.Builder) {
        val icon = notificationConfig.opt(UrbanAirshipReactModule.NOTIFICATION_ICON_KEY).string
        icon?.let {
            val resourceId = getNamedResource(context, it, "drawable")
            builder.setNotificationIcon(resourceId)
        }

        val largeIcon = notificationConfig.opt(UrbanAirshipReactModule.NOTIFICATION_LARGE_ICON_KEY).string
        largeIcon?.let {
            val resourceId = getNamedResource(context, it, "drawable")
            builder.setNotificationLargeIcon(resourceId)
        }

        val accentColor = notificationConfig.opt(UrbanAirshipReactModule.ACCENT_COLOR_KEY).string
        accentColor?.let {
            builder.setNotificationAccentColor(getHexColor(it, 0))
        }

        val channelId = notificationConfig.opt(UrbanAirshipReactModule.DEFAULT_CHANNEL_ID_KEY).string
        channelId?.let {
            builder.setNotificationChannel(it)
        }
    }

    @PrivacyManager.Feature
    private fun parseFeatures(jsonList: JsonList): Int {
        var result = PrivacyManager.FEATURE_NONE
        for (value in jsonList) {
            result = result or parseFeature(value.optString())
        }
        return result
    }

    @AirshipConfigOptions.Site
    private fun parseSite(value: String): String {
        when (value) {
            "eu" -> return AirshipConfigOptions.SITE_EU
            "us" -> return AirshipConfigOptions.SITE_US
        }
        throw IllegalArgumentException("Invalid site: $value")
    }

    companion object {
        const val EXTENDER_MANIFEST_KEY = "com.urbanairship.reactnative.AIRSHIP_EXTENDER"

        private fun sendShowInboxEvent(messageId: String?) {
            val event: Event = DisplayMessageCenterEvent(messageId)
            EventEmitter.shared().sendEvent(event)
        }

        private fun createExtender(context: Context): AirshipExtender? {
            val ai: ApplicationInfo
            try {
                ai = context.packageManager.getApplicationInfo(context.packageName, PackageManager.GET_META_DATA)

                if (ai.metaData == null) {
                    return null
                }
            } catch (e: PackageManager.NameNotFoundException) {
                return null
            }

            val classname = ai.metaData.getString(EXTENDER_MANIFEST_KEY) ?: return null

            try {
                val extenderClass = Class.forName(classname)
                return extenderClass.newInstance() as AirshipExtender
            } catch (e: Exception) {
                PluginLogger.error(e, "Unable to create extender: $classname")
            }
            return null
        }

        private fun convertLogLevel(logLevel: String, defaultValue: Int): Int {
            when (logLevel) {
                "verbose" -> return Log.VERBOSE
                "debug" -> return Log.DEBUG
                "info" -> return Log.INFO
                "warning" -> return Log.WARN
                "error" -> return Log.ERROR
                "none" -> return Log.ASSERT
            }
            return defaultValue
        }

        private fun parseArray(value: JsonValue?): Array<String?>? {
            if (value == null || !value.isJsonList) {
                return null
            }

            val result = arrayOfNulls<String>(value.optList().size())
            for (i in 0 until value.optList().size()) {
                val string = value.optList()[i].string
                if (string == null) {
                    PluginLogger.error("Invalid string array: $value")
                    return null
                }
                result[i] = string
            }
            return result
        }
    }
}
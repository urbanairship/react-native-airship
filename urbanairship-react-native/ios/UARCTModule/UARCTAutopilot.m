/* Copyright Airship and Contributors */

#import "UARCTAutopilot.h"
#import "UARCTModuleVersion.h"
#import "UARCTStorage.h"
#import "UARCTUtils.h"

#import "UARCTAirshipListener.h"

@implementation UARCTAutopilot

static BOOL disabled = NO;

+ (void)load {
    NSNotificationCenter *center = [NSNotificationCenter defaultCenter];
    [center addObserverForName:UIApplicationDidFinishLaunchingNotification
                        object:nil
                         queue:nil usingBlock:^(NSNotification * _Nonnull note) {

        [self takeOffWithLaunchOptions:note.userInfo];
    }];
}

+ (void)disable {
    disabled = YES;
}

+ (void)takeOffWithLaunchOptions:(NSDictionary *)launchOptions {
    if (disabled || UAirship.isFlying) {
        return;
    }

    UAConfig *config = [self config];
    [UAirship takeOff:config launchOptions:launchOptions];

    if (!UAirship.isFlying) {
        return;
    }

    static dispatch_once_t takeOffdispatchOnce_;
    dispatch_once(&takeOffdispatchOnce_, ^{
        UA_LINFO(@"Airship ReactNative version: %@, SDK version: %@", [UARCTModuleVersion get], [UAirshipVersion get]);
        [[UAirship analytics] registerSDKExtension:UASDKExtensionReactNative version:[UARCTModuleVersion get]];

        [self loadCustomNotificationCategories];

        UARCTAirshipListener *listener = [UARCTAirshipListener shared];

        UAirship.shared.deepLinkDelegate = listener;
        UAirship.push.registrationDelegate = listener;
        UAirship.push.pushNotificationDelegate = listener;
        UAMessageCenter.shared.displayDelegate = listener;

        
        if (UARCTStorage.isForegroundPresentationOptionsSet) {
            [UAirship push].defaultPresentationOptions = UARCTStorage.foregroundPresentationOptions;
        }
    });
}

+ (void)loadCustomNotificationCategories {
    NSString *categoriesPath = [[NSBundle mainBundle] pathForResource:@"UACustomNotificationCategories" ofType:@"plist"];
    NSSet *customNotificationCategories = [UANotificationCategories createCategoriesFromFile:categoriesPath];

    if (customNotificationCategories.count) {
        UA_LDEBUG(@"Registering custom notification categories: %@", customNotificationCategories);
        [UAirship push].customCategories = customNotificationCategories;
        [[UAirship push] updateRegistration];
    }
}

+ (UAConfig *)config {
    NSLog(@"config loaded ma gueule");
    UAConfig *config = [UAConfig defaultConfig];

    NSDictionary *storedConfig = UARCTStorage.airshipConfig;
    if (!storedConfig.count) {
        return config;
    }

    id defaultEnvironment = [self parseDictionaryForKey:@"default" from:storedConfig];
    id prodEnvironment = [self parseDictionaryForKey:@"production" from:storedConfig];
    id devEnvironment = [self parseDictionaryForKey:@"development" from:storedConfig];

    // Environments
    if (defaultEnvironment) {
        config.defaultAppKey = [self parseStringForKey:@"appKey" from:defaultEnvironment];
        config.defaultAppSecret = [self parseStringForKey:@"appSecret" from:defaultEnvironment];
    }

    if (prodEnvironment) {
        config.productionAppKey = [self parseStringForKey:@"appKey" from:prodEnvironment];
        config.productionAppSecret = [self parseStringForKey:@"appSecret" from:prodEnvironment];
    }

    if (devEnvironment) {
        config.developmentAppKey = [self parseStringForKey:@"appKey" from:devEnvironment];
        config.developmentAppSecret = [self parseStringForKey:@"appSecret" from:devEnvironment];
    }

    NSString *productionLogLevel = [self parseStringForKey:@"logLevel" from:prodEnvironment];
    NSString *developmentLogLevel = [self parseStringForKey:@"logLevel" from:devEnvironment];
    NSString *defaultLogLevel = [self parseStringForKey:@"logLevel" from:defaultEnvironment];

    if (productionLogLevel || defaultLogLevel) {
        config.productionLogLevel = [self logLevelFromString:productionLogLevel ?: defaultLogLevel
                                                defaultValue:UALogLevelError];
    }

    if (developmentLogLevel || defaultLogLevel) {
        config.developmentLogLevel = [self logLevelFromString:developmentLogLevel ?: defaultLogLevel
                                                defaultValue:UALogLevelDebug];
    }

    if (storedConfig[@"inProduction"]) {
        config.inProduction = [storedConfig[@"inProduction"] boolValue];
    }

    // Site
    NSString *site = [self parseStringForKey:@"site" from:storedConfig];
    config.site = [self siteFromString:site];

    // Allow lists
    NSArray *allowList = [self parseStringArrayForKey:@"urlAllowList" from:storedConfig];
    if (allowList) {
        config.URLAllowList = allowList;
    }

    NSArray *allowListOpenURL = [self parseStringArrayForKey:@"urlAllowListScopeOpenUrl" from:storedConfig];
    if (allowListOpenURL) {
        config.URLAllowListScopeOpenURL = allowListOpenURL;
    }

    NSArray *allowListJS = [self parseStringArrayForKey:@"urlAllowListScopeJavaScriptInterface" from:storedConfig];
    if (allowListJS) {
        config.URLAllowListScopeJavaScriptInterface = allowListJS;
    }

    // Channel creation delay
    if (storedConfig[@"isChannelCreationDelayEnabled"]) {
        config.isChannelCreationDelayEnabled = [storedConfig[@"isChannelCreationDelayEnabled"] boolValue];
    }

    // Initail remote config
    if (storedConfig[@"requireInitialRemoteConfigEnabled"]) {
        config.requireInitialRemoteConfigEnabled = [storedConfig[@"requireInitialRemoteConfigEnabled"] boolValue];
    }

    // Features
    NSArray *enabledFeatures = [self parseStringArrayForKey:@"enabledFeatures" from:storedConfig];
    if (enabledFeatures) {
        config.enabledFeatures = [UARCTUtils stringArrayToFeatures:enabledFeatures];
    }

    // Chat
    id chat = [self parseDictionaryForKey:@"chat" from:storedConfig];
    if (chat) {
        config.chatURL = [self parseStringForKey:@"url" from:chat];
        config.chatWebSocketURL = [self parseStringForKey:@"webSocketUrl" from:chat];
    }

    // Itunes ID
    id iOS = [self parseDictionaryForKey:@"ios" from:storedConfig];
    NSString *itunesID = [self parseStringForKey:@"itunesId" from:iOS];
    if (itunesID) {
        config.itunesID = itunesID;
    }

    return config;
}

+ (NSDictionary *)parseDictionaryForKey:(NSString *)key from:(NSDictionary *)dictionary {
    id value = dictionary[key];
    if ([value isKindOfClass:[NSDictionary class]]) {
        return value;
    }
    return nil;
}

+ (NSArray *)parseStringArrayForKey:(NSString *)key from:(NSDictionary *)dictionary {
    id array = dictionary[key];
    if (![array isKindOfClass:[NSArray class]]) {
        return nil;
    }

    for (id value in array) {
        if (![value isKindOfClass:[NSString class]]) {
            return nil;
        }
    }

    return array;
}


+ (NSString *)parseStringForKey:(NSString *)key from:(NSDictionary *)dictionary {
    id value = dictionary[key];
    if ([value isKindOfClass:[NSString class]]) {
        return value;
    }
    return nil;
}

+ (UALogLevel)logLevelFromString:(NSString *)string defaultValue:(UALogLevel)defaultValue {
    if ([string isEqualToString:@"verbose"]) {
        return UALogLevelTrace;
    } else if ([string isEqualToString:@"debug"]) {
        return UALogLevelDebug;
    } else if ([string isEqualToString:@"info"]) {
        return UALogLevelInfo;
    } else if ([string isEqualToString:@"warning"]) {
        return UALogLevelWarn;
    } else if ([string isEqualToString:@"error"]) {
        return UALogLevelError;
    } else if ([string isEqualToString:@"none"]) {
        return UALogLevelNone;
    }
    return defaultValue;
}

+ (UACloudSite)siteFromString:(NSString *)string {
    if ([string isEqualToString:@"eu"]) {
        return UACloudSiteEU;
    } else if ([string isEqualToString:@"us"]) {
        return UACloudSiteUS;
    }

    return UACloudSiteUS;
}

@end


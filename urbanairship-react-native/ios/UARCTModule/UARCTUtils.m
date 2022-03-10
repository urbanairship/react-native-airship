#import "UARCTUtils.h"

@implementation UARCTUtils

+ (NSString *)authorizedStatusString:(UAAuthorizationStatus)status {
    switch (status) {
        case UAAuthorizationStatusDenied:
            return @"denied";
        case UAAuthorizationStatusEphemeral:
            return @"ephemeral";
        case UAAuthorizationStatusAuthorized:
            return @"authorized";
        case UAAuthorizationStatusProvisional:
            return @"provisional";
        case UAAuthorizationStatusNotDetermined:
        default:
            return @"notDetermined";
    }
}

+ (UANotificationOptions)optionsFromOptionsArray:(NSArray *)options {
    UANotificationOptions notificationOptions = UANotificationOptionNone;

    if ([options containsObject:@"alert"]) {
        notificationOptions = notificationOptions | UANotificationOptionAlert;
    }

    if ([options containsObject:@"badge"]) {
        notificationOptions = notificationOptions | UANotificationOptionBadge;
    }

    if ([options containsObject:@"sound"]) {
        notificationOptions = notificationOptions | UANotificationOptionSound;
    }
    
    if ([options containsObject:@"carPlay"]) {
        notificationOptions = notificationOptions | UANotificationOptionCarPlay;
    }
    
    if ([options containsObject:@"criticalAlert"]) {
        notificationOptions = notificationOptions | UANotificationOptionCriticalAlert;
    }
    
    if ([options containsObject:@"providesAppNotificationSettings"]) {
        notificationOptions = notificationOptions | UANotificationOptionProvidesAppNotificationSettings;
    }
    
    if ([options containsObject:@"provisional"]) {
        notificationOptions = notificationOptions | UANotificationOptionProvisional;
    }
    
    return notificationOptions;
}

+ (NSArray<NSString *> *)authorizedSettingsArray:(UAAuthorizedNotificationSettings)settings {
    NSMutableArray *settingsArray = [NSMutableArray array];
    if (settings & UAAuthorizedNotificationSettingsAlert) {
        [settingsArray addObject:@"alert"];
    }
    if (settings & UAAuthorizedNotificationSettingsBadge) {
        [settingsArray addObject:@"badge"];
    }
    if (settings & UAAuthorizedNotificationSettingsSound) {
        [settingsArray addObject:@"sound"];
    }
    if (settings & UAAuthorizedNotificationSettingsCarPlay) {
        [settingsArray addObject:@"carPlay"];
    }
    if (settings & UAAuthorizedNotificationSettingsLockScreen) {
        [settingsArray addObject:@"lockScreen"];
    }
    if (settings & UAAuthorizedNotificationSettingsNotificationCenter) {
        [settingsArray addObject:@"notificationCenter"];
    }
    if (settings & UAAuthorizedNotificationSettingsAnnouncement) {
        [settingsArray addObject:@"announcement"];
    }
    if (settings & UAAuthorizedNotificationSettingsScheduledDelivery) {
        [settingsArray addObject:@"scheduledDelivery"];
    }
    if (settings & UAAuthorizedNotificationSettingsTimeSensitive) {
        [settingsArray addObject:@"timeSensitive"];
    }
    
    return settingsArray;
}

+ (NSDictionary *)authorizedSettingsDictionary:(UAAuthorizedNotificationSettings)settings {
    return @{
        @"alert" : @(settings & UAAuthorizedNotificationSettingsAlert),
        @"badge" : @(settings & UAAuthorizedNotificationSettingsBadge),
        @"sound" : @(settings & UAAuthorizedNotificationSettingsSound),
        @"carPlay" : @(settings & UAAuthorizedNotificationSettingsCarPlay),
        @"lockScreen" : @(settings & UAAuthorizedNotificationSettingsLockScreen),
        @"notificationCenter" : @(settings & UAAuthorizedNotificationSettingsNotificationCenter),
        @"criticalAlert" : @(settings & UAAuthorizedNotificationSettingsNotificationCenter),
        @"announcement" : @(settings & UAAuthorizedNotificationSettingsNotificationCenter),
        @"scheduledDelivery" : @(settings & UAAuthorizedNotificationSettingsNotificationCenter),
        @"timeSensitive" : @(settings & UAAuthorizedNotificationSettingsNotificationCenter),
    };
}


+ (NSDictionary *)eventBodyForNotificationResponse:(UNNotificationResponse *)notificationResponse {
    NSMutableDictionary *body = [NSMutableDictionary dictionary];
    [body setValue:[self eventBodyForNotificationContent:notificationResponse.notification.request.content.userInfo notificationIdentifier:notificationResponse.notification.request.identifier]
            forKey:@"notification"];

    if ([notificationResponse.actionIdentifier isEqualToString:UNNotificationDefaultActionIdentifier]) {
        [body setValue:@(YES) forKey:@"isForeground"];
    } else {
        UNNotificationAction *notificationAction = [self notificationActionForCategory:notificationResponse.notification.request.content.categoryIdentifier
                                                                      actionIdentifier:notificationResponse.actionIdentifier];
        BOOL isForeground = notificationAction.options & UNNotificationActionOptionForeground;

        [body setValue:@(isForeground) forKey:@"isForeground"];
        [body setValue:notificationResponse.actionIdentifier forKey:@"actionId"];
    }

    return body;
}

+ (NSMutableDictionary *)eventBodyForNotificationContent:(NSDictionary *)userInfo notificationIdentifier:(NSString *)identifier {

    NSMutableDictionary *pushBody = [NSMutableDictionary dictionary];
    if (identifier != nil) {
        [pushBody setValue:identifier forKey:@"notificationId"];
    }

    // Extras
    NSMutableDictionary *extras = [NSMutableDictionary dictionaryWithDictionary:userInfo];
    [extras removeObjectForKey:@"aps"];
    [extras removeObjectForKey:@"_"];
    if (extras.count) {
        [pushBody setValue:extras forKey:@"extras"];
    }

    // Fill in the notification title, subtitle and body if exists
    NSDictionary* aps = extras[@"aps"];
    if (aps) {
        id alert = aps[@"alert"];
        if ([alert isKindOfClass:[NSDictionary class]]) {
            [pushBody setValue:alert[@"title"] forKey:@"title"];
            [pushBody setValue:alert[@"body"] forKey:@"alert"];
            [pushBody setValue:alert[@"subtitle"] forKey:@"subtitle"];
        } else {
            [pushBody setValue:alert forKey:@"alert"];
        }
    }

    return pushBody;
}

+ (UNNotificationAction *)notificationActionForCategory:(NSString *)category actionIdentifier:(NSString *)identifier {
    NSSet *categories = [UAirship push].combinedCategories;

    UNNotificationCategory *notificationCategory;
    UNNotificationAction *notificationAction;

    for (UNNotificationCategory *possibleCategory in categories) {
        if ([possibleCategory.identifier isEqualToString:category]) {
            notificationCategory = possibleCategory;
            break;
        }
    }

    if (!notificationCategory) {
        UA_LERR(@"Unknown notification category identifier %@", category);
        return nil;
    }

    NSMutableArray *possibleActions = [NSMutableArray arrayWithArray:notificationCategory.actions];

    for (UNNotificationAction *possibleAction in possibleActions) {
        if ([possibleAction.identifier isEqualToString:identifier]) {
            notificationAction = possibleAction;
            break;
        }
    }

    if (!notificationAction) {
        UA_LERR(@"Unknown notification action identifier %@", identifier);
        return nil;
    }

    return notificationAction;
}

+ (BOOL)isValidFeatureArray:(NSArray *)stringArray {
    for (id value in stringArray) {
        if (![self.featureMap allKeysForObject:value].count) {
            return NO;
        }
    }
    return YES;
}

+ (UAFeatures)stringArrayToFeatures:(NSArray *)stringArray {
    UAFeatures result = UAFeaturesNone;
    for (id value in stringArray) {
        NSNumber *featureValue = [[self.featureMap allKeysForObject:value] firstObject];
        if (featureValue) {
            result |= [featureValue unsignedIntegerValue];
        }
    }
    return result;
}

+ (NSArray *)featureToStringArray:(UAFeatures)features {
    if (features == UAFeaturesAll) {
        return @[self.featureMap[@(UAFeaturesAll)]];
    }

    if (features == UAFeaturesNone) {
        return @[self.featureMap[@(UAFeaturesNone)]];
    }
    

    NSMutableArray *result = [NSMutableArray array];
    for (NSNumber *key in self.featureMap.allKeys) {
        if (features & [key unsignedIntegerValue]) {
            [result addObject:self.featureMap[key]];
        }
    }
    return result;
}

+ (NSDictionary *)featureMap {
    static NSDictionary* _featureMap = nil;
    static dispatch_once_t _featureMapOnceToken;
    dispatch_once(&_featureMapOnceToken, ^{
        _featureMap = @{
            @(UAFeaturesInAppAutomation): @"FEATURE_IN_APP_AUTOMATION",
            @(UAFeaturesMessageCenter): @"FEATURE_MESSAGE_CENTER",
            @(UAFeaturesPush): @"FEATURE_PUSH",
            @(UAFeaturesChat): @"FEATURE_CHAT",
            @(UAFeaturesAnalytics): @"FEATURE_ANALYTICS",
            @(UAFeaturesTagsAndAttributes): @"FEATURE_TAGS_AND_ATTRIBUTES",
            @(UAFeaturesContacts): @"FEATURE_CONTACTS",
            @(UAFeaturesLocation): @"FEATURE_LOCATION",
        };
    });
    return _featureMap;
}
@end

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

@end

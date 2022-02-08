#if __has_include("AirshipLib.h")
#import "AirshipLib.h"
#else
@import AirshipKit;
#endif

NS_ASSUME_NONNULL_BEGIN

@interface UARCTUtils : NSObject

+ (UANotificationOptions)optionsFromOptionsArray:(NSArray *)options;
+ (NSArray<NSString *> *)authorizedSettingsArray:(UAAuthorizedNotificationSettings)settings;
+ (NSDictionary *)authorizedSettingsDictionary:(UAAuthorizedNotificationSettings)settings;
+ (NSString *)authorizedStatusString:(UAAuthorizationStatus)status;
@end

NS_ASSUME_NONNULL_END

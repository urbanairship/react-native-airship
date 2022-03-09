/* Copyright Urban Airship and Contributors */

#import <Foundation/Foundation.h>
#import <UserNotifications/UNUserNotificationCenter.h>

NS_ASSUME_NONNULL_BEGIN

@interface UARCTStorage : NSObject

@property (class, nonatomic, assign) BOOL autoLaunchMessageCenter;
@property (class, nonatomic, assign) UNNotificationPresentationOptions foregroundPresentationOptions;
@property (class, nonatomic, readonly) BOOL isForegroundPresentationOptionsSet;
@property (class, nonatomic, assign) BOOL autoLaunchChat;

+ (BOOL)autoLaunchPreferencesForID:(NSString *)preferenceCenterID;
+ (void)setAutoLaunch:(BOOL)autoLaunch preferencesForID:(NSString *)preferenceCenterID;

@end

NS_ASSUME_NONNULL_END

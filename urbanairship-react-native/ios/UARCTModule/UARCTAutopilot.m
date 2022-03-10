/* Copyright Airship and Contributors */

#import "UARCTAutopilot.h"
#import "UARCTModuleVersion.h"


@implementation UARCTAutopilot

static BOOL disabled = NO;

+ (void)disable {
    disabled = YES;
}

+ (BOOL)takeOffWithLaunchOptions:(NSDictionary *)launchOptions {
    if (disabled || UAirship.isFlying) {
        return NO;
    }
    
    [UAirship takeOffWithLaunchOptions:launchOptions];
    
    if (!UAirship.isFlying) {
        return NO;
    }

    static dispatch_once_t takeOffdispatchOnce_;
    dispatch_once(&takeOffdispatchOnce_, ^{

        UA_LINFO(@"Airship ReactNative version: %@, SDK version: %@", [UARCTModuleVersion get], [UAirshipVersion get]);
        [[UAirship analytics] registerSDKExtension:UASDKExtensionReactNative version:[UARCTModuleVersion get]];

        [self loadCustomNotificationCategories];
    });

    return YES;
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

@end

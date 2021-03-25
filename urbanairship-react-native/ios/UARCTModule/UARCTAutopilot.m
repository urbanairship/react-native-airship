/* Copyright Airship and Contributors */

#import "UARCTAutopilot.h"
#import "UARCTEventEmitter.h"
#import "UARCTDeepLinkAction.h"
#import "UARCTMessageCenter.h"
#import "UARCTModuleVersion.h"

NSString *const UARCTPresentationOptionsStorageKey = @"com.urbanairship.presentation_options";
NSString *const UARCTAirshipRecommendedVersion = @"14.3.0";

@implementation UARCTAutopilot

static BOOL disabled = NO;

+ (void)disable {
    disabled = YES;
}

+ (void)load {
    NSNotificationCenter *center = [NSNotificationCenter defaultCenter];
    [center addObserver:[UARCTAutopilot class] selector:@selector(takeOff) name:UIApplicationDidFinishLaunchingNotification object:nil];
}

+ (void)takeOff {
    if (disabled) {
        return;
    }

    static dispatch_once_t takeOffdispatchOnce_;
    dispatch_once(&takeOffdispatchOnce_, ^{
        [UAirship takeOff];

        UA_LINFO(@"Airship ReactNative version: %@, SDK version: %@", [UARCTModuleVersion get], [UAirshipVersion get]);
        [[UAirship analytics] registerSDKExtension:UASDKExtensionReactNative version:[UARCTModuleVersion get]];

        [UAirship push].pushNotificationDelegate = [UARCTEventEmitter shared];
        [UAirship push].registrationDelegate = [UARCTEventEmitter shared];
        [UAMessageCenter shared].displayDelegate  = [UARCTMessageCenter shared];

        // Register custom deep link action
        UARCTDeepLinkAction *dle = [[UARCTDeepLinkAction alloc] init];
        [[UAirship shared].actionRegistry updateAction:dle forEntryWithName:UADeepLinkActionDefaultRegistryName];
        dle.deepLinkDelegate = [UARCTEventEmitter shared];

        // Add observer for inbox updated event
        [[NSNotificationCenter defaultCenter] addObserver:[UARCTEventEmitter shared]
                                            selector:@selector(inboxUpdated)
                                                name:UAInboxMessageListUpdatedNotification
                                            object:nil];

        if ([[NSUserDefaults standardUserDefaults] objectForKey:UARCTPresentationOptionsStorageKey]) {
            UNNotificationPresentationOptions presentationOptions = [[NSUserDefaults standardUserDefaults] integerForKey:UARCTPresentationOptionsStorageKey];
            UA_LDEBUG(@"Foreground presentation options set: %lu", (unsigned long)presentationOptions);
            [[UAirship push] setDefaultPresentationOptions:presentationOptions];
        }

        if ([[NSUserDefaults standardUserDefaults] objectForKey:UARCTAutoLaunchMessageCenterKey] == nil) {
            [[NSUserDefaults standardUserDefaults] setBool:true forKey:UARCTAutoLaunchMessageCenterKey];
        }

        if (([UARCTAirshipRecommendedVersion compare:[UAirshipVersion get] options:NSNumericSearch] == NSOrderedDescending)) {
            UA_LIMPERR(@"Current version of Airship is below the recommended version. Current version: %@ Recommended version: %@", [UAirshipVersion get], UARCTAirshipRecommendedVersion);
        }

        [self loadCustomNotificationCategories];
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

@end

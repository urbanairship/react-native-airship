/* Copyright 2017 Urban Airship and Contributors */

#import <UIKit/UIKit.h>
#import "UARCTAutopilot.h"
#import "UARCTEventEmitter.h"
#import "UARCTDeepLinkAction.h"
#import "UARCTMessageCenter.h"

#import "AirshipLib.h"

NSString *const UARCTPresentationOptionsStorageKey = @"com.urbanairship.presentation_options";
NSString *const UARCTAirshipKitRecommendedVersion = @"8.4.3";

@implementation UARCTAutopilot

+ (void)load {
    NSNotificationCenter *center = [NSNotificationCenter defaultCenter];
    [center addObserver:[UARCTAutopilot class] selector:@selector(performTakeOff:) name:UIApplicationDidFinishLaunchingNotification object:nil];
}

+ (void)performTakeOff:(NSNotification *)notification {
    [UAirship takeOff];

    [UAirship push].pushNotificationDelegate = [UARCTEventEmitter shared];
    [UAirship push].registrationDelegate = [UARCTEventEmitter shared];
    [UAirship inbox].delegate = [UARCTMessageCenter shared];

    // Register custom deep link action
    UARCTDeepLinkAction *dle = [[UARCTDeepLinkAction alloc] init];
    [[UAirship shared].actionRegistry updateAction:dle forEntryWithName:kUADeepLinkActionDefaultRegistryName];
    dle.deepLinkDelegate = [UARCTEventEmitter shared];

    // Add observer for inbox updated event
    [[NSNotificationCenter defaultCenter] addObserver:[UARCTEventEmitter shared]
                                         selector:@selector(inboxUpdated)
                                             name:UAInboxMessageListUpdatedNotification
                                           object:nil];

    UNNotificationPresentationOptions presentationOptions = (UNNotificationPresentationOptions)[[NSUserDefaults standardUserDefaults] valueForKey:UARCTPresentationOptionsStorageKey];

    if (presentationOptions) {
        [[UAirship push] setDefaultPresentationOptions:presentationOptions];
    }
    
    if ([[NSUserDefaults standardUserDefaults] objectForKey:UARCTAutoLaunchMessageCenterKey] == nil) {
        [[NSUserDefaults standardUserDefaults] setBool:true forKey:UARCTAutoLaunchMessageCenterKey];
        [[NSUserDefaults standardUserDefaults] synchronize];
    }

    if (([UARCTAirshipKitRecommendedVersion compare:[UAirshipVersion get] options:NSNumericSearch] == NSOrderedDescending)) {
         UA_LIMPERR(@"Current version of AirshipKit is below the recommended version. Current version: %@ Recommended version: %@", [UAirshipVersion get], UARCTAirshipKitRecommendedVersion);
    }


}

@end

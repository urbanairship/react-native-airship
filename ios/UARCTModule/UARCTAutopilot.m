/* Copyright 2017 Urban Airship and Contributors */

#import <UIKit/UIKit.h>
#import "UARCTAutopilot.h"
#import "UARCTEventEmitter.h"
#import "UARCTDeepLinkAction.h"

#import "AirshipLib.h"

NSString *const UARCTPresentationOptionsStorageKey = @"com.urbanairship.presentation_options";

@implementation UARCTAutopilot

+ (void)load {
    NSNotificationCenter *center = [NSNotificationCenter defaultCenter];
    [center addObserver:[UARCTAutopilot class] selector:@selector(performTakeOff:) name:UIApplicationDidFinishLaunchingNotification object:nil];
}

+ (void)performTakeOff:(NSNotification *)notification {
    [UAirship takeOff];

    [UAirship push].pushNotificationDelegate = [UARCTEventEmitter shared];
    [UAirship push].registrationDelegate = [UARCTEventEmitter shared];

    // Register custom deep link action
    UARCTDeepLinkAction *dle = [[UARCTDeepLinkAction alloc] init];
    [[UAirship shared].actionRegistry updateAction:dle forEntryWithName:kUADeepLinkActionDefaultRegistryName];
    dle.deepLinkDelegate = [UARCTEventEmitter shared];

    UNNotificationPresentationOptions presentationOptions = (UNNotificationPresentationOptions)[[NSUserDefaults standardUserDefaults] valueForKey:UARCTPresentationOptionsStorageKey];

    if (presentationOptions) {
        [[UAirship push] setDefaultPresentationOptions:presentationOptions];
    }

}

@end

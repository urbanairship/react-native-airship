/* Copyright 2017 Urban Airship and Contributors */

#import <UIKit/UIKit.h>
#import "UARCTAutopilot.h"
#import "UARCTEventEmitter.h"
#import "UARCTDeepLinkEvent.h"

#import "AirshipLib.h"

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
    UARCTDeepLinkEvent *dle = [[UARCTDeepLinkEvent alloc] init];
    [[UAirship shared].actionRegistry updateAction:dle forEntryWithName:kUADeepLinkActionDefaultRegistryName];
    dle.deepLinkDelegate = [UARCTEventEmitter shared];
}

@end

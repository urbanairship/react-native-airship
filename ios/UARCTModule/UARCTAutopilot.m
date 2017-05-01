/* Copyright 2017 Urban Airship and Contributors */

#import <UIKit/UIKit.h>
#import "UARCTAutopilot.h"
#import "AirshipLib.h"

@implementation UARCTAutopilot

+ (void)load {
    NSNotificationCenter *center = [NSNotificationCenter defaultCenter];
    [center addObserver:[UARCTAutopilot class] selector:@selector(performTakeOff:) name:UIApplicationDidFinishLaunchingNotification object:nil];
}

+ (void)performTakeOff:(NSNotification *)notification {
    [UAirship takeOff];
}

@end

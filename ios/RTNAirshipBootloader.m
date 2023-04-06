/* Copyright Airship and Contributors */

#import "RTNAirshipBootloader.h"

#if __has_include(<react_native_airship/react_native_airship-Swift.h>)
#import <react_native_airship/react_native_airship-Swift.h>
#else
#import "react_native_airship-Swift.h"
#endif

@implementation RTNAirshipBootloader

static BOOL disabled = NO;

+ (void)load {
    NSNotificationCenter *center = [NSNotificationCenter defaultCenter];
    [center addObserverForName:UIApplicationDidFinishLaunchingNotification
                        object:nil
                         queue:nil usingBlock:^(NSNotification * _Nonnull note) {

        if (!disabled) {
            [AirshipReactNative.shared onLoadWithLaunchOptions:note.userInfo];
        }
    }];
}

+ (void)disable {
    disabled = YES;
}
@end


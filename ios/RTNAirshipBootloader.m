/* Copyright Airship and Contributors */

#import "RTNAirshipBootloader.h"
#import "react_nativE_airship-Swift.h"

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


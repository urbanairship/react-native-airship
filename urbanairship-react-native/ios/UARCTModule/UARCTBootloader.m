/* Copyright Airship and Contributors */

#import "UARCTBootloader.h"

@implementation UARCTBootloader

static BOOL disabled = NO;

+ (void)load {
    NSNotificationCenter *center = [NSNotificationCenter defaultCenter];
    [center addObserverForName:UIApplicationDidFinishLaunchingNotification
                        object:nil
                         queue:nil usingBlock:^(NSNotification * _Nonnull note) {

        if (!disabled) {
            SEL selector = NSSelectorFromString(@"attemptTakeOffWithLaunchOptions:");
            id class = NSClassFromString(@"AirshipAutopilot");
            IMP imp = [class methodForSelector:selector];
            void (*takeOff)(id, SEL, NSDictionary *) = (void *)imp;
            takeOff(class, selector, note.userInfo);
        }
    }];
}

+ (void)disable {
    disabled = YES;
}
@end


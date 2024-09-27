/* Copyright Airship and Contributors */

#import "RTNAirshipBootloader.h"

#if __has_include(<react_native_airship/react_native_airship-Swift.h>)
#import <react_native_airship/react_native_airship-Swift.h>
#else
#import "react_native_airship-Swift.h"
#endif

@implementation RTNAirshipBootloader


+ (void)disable {
    AirshipPluginLoader.disabled = YES;
}
@end


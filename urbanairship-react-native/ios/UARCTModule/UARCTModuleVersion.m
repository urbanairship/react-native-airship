/* Copyright Airship and Contributors */

#import "UARCTModuleVersion.h"

@implementation UARCTModuleVersion

NSString *const airshipModuleVersionString = @"10.0.2";

+ (nonnull NSString *)get {
    return airshipModuleVersionString;
}

@end

/* Copyright Airship and Contributors */

#import "UARCTModuleVersion.h"

@implementation UARCTModuleVersion

NSString *const airshipModuleVersionString = @"8.0.1";

+ (nonnull NSString *)get {
    return airshipModuleVersionString;
}

@end

/* Copyright Airship and Contributors */

#import "UARCTModuleVersion.h"

@implementation UARCTModuleVersion

NSString *const airshipModuleVersionString = @"9.0.1";

+ (nonnull NSString *)get {
    return airshipModuleVersionString;
}

@end

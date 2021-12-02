/* Copyright Airship and Contributors */

#import "UARCTModuleVersion.h"

@implementation UARCTModuleVersion

NSString *const airshipModuleVersionString = @"13.0.3";

+ (nonnull NSString *)get {
    return airshipModuleVersionString;
}

@end

/* Copyright Airship and Contributors */

#import "UARCTModuleVersion.h"

@implementation UARCTModuleVersion

NSString *const airshipModuleVersionString = @"14.0.0";

+ (nonnull NSString *)get {
    return airshipModuleVersionString;
}

@end

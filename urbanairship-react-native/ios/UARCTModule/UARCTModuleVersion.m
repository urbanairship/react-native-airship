/* Copyright Airship and Contributors */

#import "UARCTModuleVersion.h"

@implementation UARCTModuleVersion

NSString *const airshipModuleVersionString = @"14.2.1";

+ (nonnull NSString *)get {
    return airshipModuleVersionString;
}

@end

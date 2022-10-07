/* Copyright Airship and Contributors */

#import "UARCTModuleVersion.h"

@implementation UARCTModuleVersion

NSString *const airshipModuleVersionString = @"14.4.4";

+ (nonnull NSString *)get {
    return airshipModuleVersionString;
}

@end

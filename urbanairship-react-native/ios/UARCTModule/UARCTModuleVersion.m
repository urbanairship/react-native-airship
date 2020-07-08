/* Copyright Airship and Contributors */

#import "UARCTModuleVersion.h"

@implementation UARCTModuleVersion

NSString *const moduleVersionString = @"8.0.0";

+ (nonnull NSString *)get {
    return moduleVersionString;
}

@end

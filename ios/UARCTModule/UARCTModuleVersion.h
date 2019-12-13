/* Copyright Airship and Contributors */

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

/**
* The Airship react native module version.
*/
@interface UARCTModuleVersion : NSObject

/**
 * Returns the Airship react native module version.
 *
 *  @return NSString representing the version of the Airship react module.
 */
+ (nonnull NSString *)get;

@end

NS_ASSUME_NONNULL_END

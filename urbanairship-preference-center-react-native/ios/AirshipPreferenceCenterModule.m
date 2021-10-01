#import "AirshipPreferenceCenterModule.h"
#import "UARCTEventEmitter.h"

@implementation AirshipPreferenceCenterModule

RCT_EXPORT_MODULE()

- (instancetype)init{
    self = [super init];
    if (self) {
    }
    return self;
}

RCT_EXPORT_METHOD(open:(NSString *)preferenceID) {
    [[NSOperationQueue mainQueue] addOperationWithBlock:^ {
        [[UAPreferenceCenter shared] openPreferenceCenter:preferenceID];
    }];
}

RCT_EXPORT_METHOD(setUseCustomPreferenceCenterUI:(BOOL)useCustomUI forpreferenceID:(NSString *)preferenceID) {
    [[NSOperationQueue mainQueue] addOperationWithBlock:^ {
        [[NSUserDefaults standardUserDefaults] setBool:useCustomUI forKey:preferenceID];
        [self updateOpenPreferenceCenterDelegate:preferenceID];
    }];
}

- (void)updateOpenPreferenceCenterDelegate:(NSString *)preferenceID {
    BOOL enabled = [[NSUserDefaults standardUserDefaults] boolForKey:preferenceID];
    if (enabled) {
        [UAPreferenceCenter shared].openDelegate = self;
    } else {
        [UAPreferenceCenter shared].openDelegate = nil;
    }
}

#pragma mark -
#pragma mark UAPreferenceCenterOpenDelegate

- (BOOL)openPreferenceCenter:(NSString * _Nonnull)preferenceCenterID {
    [[UARCTEventEmitter shared] openPreferenceCenterForID:preferenceCenterID];
    return [[NSUserDefaults standardUserDefaults] boolForKey:preferenceCenterID];
}

@end

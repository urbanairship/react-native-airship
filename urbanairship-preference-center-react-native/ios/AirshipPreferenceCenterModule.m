#import "AirshipPreferenceCenterModule.h"
#import "UARCTEventEmitter.h"

@import AirshipKit;

@implementation AirshipPreferenceCenterModule

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(open:(NSString *)preferenceCenterId) {
    [[NSOperationQueue mainQueue] addOperationWithBlock:^ {
        [[UAPreferenceCenter shared] openPreferenceCenter:preferenceCenterId];
    }];
}

RCT_EXPORT_METHOD(setUseCustomPreferenceCenterUi:(BOOL)useCustomUi forpreferenceId:(NSString *)preferenceId) {
    [[NSOperationQueue mainQueue] addOperationWithBlock:^ {
        [[NSUserDefaults standardUserDefaults] setBool:useCustomUi forKey:preferenceId];
        [self updateOpenPreferenceCenterDelegate:preferenceId];
    }];
}

RCT_EXPORT_METHOD(getConfiguration:(NSString *)preferenceCenterId
                  getConfiguration_resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {

    UARemoteDataManager *remoteData = (UARemoteDataManager *)[UAirship componentForClassName:@"UARemoteDataManager"];

    __block UADisposable *disposable = [remoteData subscribeWithTypes:@[@"preference_forms"] block:^(NSArray<UARemoteDataPayload *> *payloads) {
        NSArray *forms = [payloads firstObject].data[@"preference_forms"];

        id result;
        for (id form in forms) {
            NSString *formID = form[@"form"][@"id"];
            if ([formID isEqualToString:preferenceCenterId]) {
                result = form[@"form"];
                break;
            }
        }

        [disposable dispose];
        resolve(result);
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

- (BOOL)openPreferenceCenter:(NSString * _Nonnull)preferenceCenterId {
    [[UARCTEventEmitter shared] openPreferenceCenterForID:preferenceCenterId];
    return [[NSUserDefaults standardUserDefaults] boolForKey:preferenceCenterId];
}

@end

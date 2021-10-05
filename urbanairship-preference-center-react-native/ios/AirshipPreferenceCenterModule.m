#import "AirshipPreferenceCenterModule.h"
#import "UARCTEventEmitter.h"

@import Airship;

@implementation AirshipPreferenceCenterModule

RCT_EXPORT_MODULE()

- (instancetype)init{
    self = [super init];
    if (self) {
    }
    return self;
}

RCT_EXPORT_METHOD(open:(NSString *)preferenceCenterID) {
    [[NSOperationQueue mainQueue] addOperationWithBlock:^ {
        [[UAPreferenceCenter shared] openPreferenceCenter:preferenceCenterID];
    }];
}

RCT_EXPORT_METHOD(setUseCustomPreferenceCenterUI:(BOOL)useCustomUI forpreferenceID:(NSString *)preferenceID) {
    [[NSOperationQueue mainQueue] addOperationWithBlock:^ {
        [[NSUserDefaults standardUserDefaults] setBool:useCustomUI forKey:preferenceID];
        [self updateOpenPreferenceCenterDelegate:preferenceID];
    }];
}

RCT_EXPORT_METHOD(getConfiguration:(NSString *)preferenceCenterID
                 getConfiguration_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    
    [[UAPreferenceCenter shared] configForPreferenceCenterID:preferenceCenterID completionHandler:^(UAPreferenceCenterConfig *config) {
        
        if (config) {
            NSMutableDictionary *configurationDictionary = [NSMutableDictionary dictionary];
            
            //Identifier
            [configurationDictionary setValue:config.identifier forKey:@"id"];
            
            //Sections
            NSArray* sections = config.sections;
            if (sections) {
                NSMutableArray *sectionArray = [NSMutableArray array];
                for (id<UAPreferenceSection> section in sections) {
                    NSMutableDictionary *sectionDictionary = [NSMutableDictionary dictionary];
                    
                    [sectionDictionary setValue:section.identifier forKey:@"id"];
                    
                    NSArray* items = section.items;
                    if (items) {
                        NSMutableArray *itemArray = [NSMutableArray array];
                        for (id<UAPreferenceItem> item in items) {
                            NSMutableDictionary *itemDictionary = [NSMutableDictionary dictionary];
                            [itemDictionary setValue:item.identifier forKey:@"id"];
                            
                            UAPreferenceCommonDisplay* itemCommonDisplay = item.display;
                            if (itemCommonDisplay) {
                                NSMutableDictionary *itemDisplayDictionary = [NSMutableDictionary dictionary];
                                [itemDisplayDictionary setValue:itemCommonDisplay.title forKey:@"name"];
                                [itemDisplayDictionary setValue:itemCommonDisplay.subtitle forKey:@"description"];
                                [itemDictionary setValue:itemDisplayDictionary forKey:@"CommonDisplay"];
                            }
                            [itemArray addObject:itemDictionary];
                        }
                        [sectionDictionary setValue:itemArray forKey:@"item"];
                        
                        
                        UAPreferenceCommonDisplay* sectionCommonDisplay = section.display;
                        if (sectionCommonDisplay) {
                            NSMutableDictionary *sectionDisplayDictionary = [NSMutableDictionary dictionary];
                            [sectionDisplayDictionary setValue:sectionCommonDisplay.title forKey:@"name"];
                            [sectionDisplayDictionary setValue:sectionCommonDisplay.subtitle forKey:@"description"];
                            [sectionDictionary setValue:sectionDisplayDictionary forKey:@"CommonDisplay"];
                        }
                        [sectionArray addObject:sectionDictionary];
                        
                    }
                }
                
                [configurationDictionary setValue:sectionArray forKey:@"sections"];
            }
            
            //Common display
            UAPreferenceCommonDisplay* configCommonDisplay = config.display;
            if (configCommonDisplay) {
                NSMutableDictionary *configDisplayDictionary = [NSMutableDictionary dictionary];
                [configDisplayDictionary setValue:configCommonDisplay.title forKey:@"name"];
                [configDisplayDictionary setValue:configCommonDisplay.subtitle forKey:@"description"];
                [configurationDictionary setValue:configDisplayDictionary forKey:@"CommonDisplay"];
            }
            
            
            resolve(configurationDictionary);
        }
        
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

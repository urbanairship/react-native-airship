#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import "AirshipExample-Swift.h"


@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
  [AirshipExtender setup];

  self.moduleName = @"AirshipExample";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  for (NSString* family in [UIFont familyNames])
  {
    NSLog(@"%@", family);

    for (NSString* name in [UIFont fontNamesForFamilyName: family])
    {
      NSLog(@"Family name: %@", name);
    }
  }
  
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self getBundleURL];
}

- (NSURL *)getBundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}


@end

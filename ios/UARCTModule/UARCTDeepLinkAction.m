/* Copyright Urban Airship and Contributors */

#import "UARCTDeepLinkAction.h"

@implementation UARCTDeepLinkAction

- (BOOL)acceptsArguments:(UAActionArguments *)arguments {
    if (arguments.situation == UASituationBackgroundPush || arguments.situation == UASituationBackgroundInteractiveButton) {
        return NO;
    }

    return [arguments.value isKindOfClass:[NSURL class]] || [arguments.value isKindOfClass:[NSString class]];
}

- (void)performWithArguments:(UAActionArguments *)arguments
           completionHandler:(UAActionCompletionHandler)completionHandler {

    NSString *deepLink;

    if ([arguments.value isKindOfClass:[NSURL class]]) {
        deepLink = [arguments.value absoluteString];
    } else {
        deepLink = arguments.value;
    }

    // Send DL event
    [self.deepLinkDelegate deepLinkReceived:deepLink];

    completionHandler([UAActionResult resultWithValue:arguments.value]);
}

@end

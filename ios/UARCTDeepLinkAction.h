/* Copyright 2017 Urban Airship and Contributors */

#import "AirshipLib.h"

@protocol UARCTDeepLinkDelegate

- (void)deepLinkReceived:(NSString *)deepLink;

@end

@interface UARCTDeepLinkAction : UAAction

@property (nonatomic, weak) id<UARCTDeepLinkDelegate> deepLinkDelegate;

@end

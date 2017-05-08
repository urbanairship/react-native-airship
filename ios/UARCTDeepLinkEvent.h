/* Copyright 2017 Urban Airship and Contributors */

#import "AirshipLib.h"

@protocol UARCTDeepLinkDelegate

- (void)deepLinkReceived:(NSDictionary *)data;

@end

@interface UARCTDeepLinkEvent : UAAction

@property (nonatomic, weak) id<UARCTDeepLinkDelegate> deepLinkDelegate;

@end

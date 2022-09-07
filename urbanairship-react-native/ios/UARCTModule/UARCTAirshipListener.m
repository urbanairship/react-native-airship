/* Copyright Urban Airship and Contributors */

#import "UARCTAirshipListener.h"
#import "UARCTUtils.h"
#import "UARCTStorage.h"

NSString *const UARCTRegistrationEventName = @"com.urbanairship.registration";
NSString *const UARCTNotificationResponseEventName = @"com.urbanairship.notification_response";
NSString *const UARCTPushReceivedEventName= @"com.urbanairship.push_received";
NSString *const UARCTDeepLinkEventName = @"com.urbanairship.deep_link";
NSString *const UARCTOptInStatusChangedEventName = @"com.urbanairship.notification_opt_in_status";
NSString *const UARCTInboxUpdatedEventName = @"com.urbanairship.inbox_updated";
NSString *const UARCTShowInboxEventName = @"com.urbanairship.show_inbox";
NSString *const UAChannelUpdatedEventChannelKey = @"com.urbanairship.channel.identifier";


@interface UARCTAirshipListener()
@property(nonatomic, strong) UARCTEventEmitter *eventEmitter;
@end

@implementation UARCTAirshipListener

+ (UARCTAirshipListener *)shared {
    static UARCTAirshipListener *airshipListener_ = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        airshipListener_ = [[UARCTAirshipListener alloc] init];
    });
    return airshipListener_;
}

- (instancetype)init {
    self = [super init];
    if (self) {
        self.eventEmitter = [UARCTEventEmitter shared];
        
        // Add observer for inbox updated event
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                 selector:@selector(inboxUpdated)
                                                     name:UAInboxMessageListUpdatedNotification
                                                 object:nil];

        // Channel registration
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                 selector:@selector(channelRegistrationSucceeded:)
                                                     name:UAChannel.channelUpdatedEvent
                                                   object:nil];
    }
    return self;
}

#pragma mark -
#pragma mark UADeepLinkDelegate

-(void)receivedDeepLink:(NSURL *)deepLink completionHandler:(void (^)(void))completionHandler {
    id body = @{ @"deepLink" : deepLink.absoluteString };
    [self.eventEmitter sendEventWithName:UARCTDeepLinkEventName body:body];
    completionHandler();
}

#pragma mark -
#pragma mark UAPushDelegate
-(void)receivedForegroundNotification:(NSDictionary *)userInfo completionHandler:(void (^)(void))completionHandler {
    id body = [UARCTUtils eventBodyForNotificationContent:userInfo notificationIdentifier:nil];
    [self.eventEmitter sendEventWithName:UARCTPushReceivedEventName body:body];
    completionHandler();
}

-(void)receivedBackgroundNotification:(NSDictionary *)userInfo
                    completionHandler:(void (^)(UIBackgroundFetchResult))completionHandler {

    id body = [UARCTUtils eventBodyForNotificationContent:userInfo notificationIdentifier:nil];
    [self.eventEmitter sendEventWithName:UARCTPushReceivedEventName body:body];
    completionHandler(UIBackgroundFetchResultNoData);
}

-(void)receivedNotificationResponse:(UNNotificationResponse *)notificationResponse
                  completionHandler:(void (^)(void))completionHandler {
    // Ignore dismisses for now
    if ([notificationResponse.actionIdentifier isEqualToString:UNNotificationDismissActionIdentifier]) {
        completionHandler();
        return;
    }

    id body = [UARCTUtils eventBodyForNotificationResponse:notificationResponse];
    [self.eventEmitter sendEventWithName:UARCTNotificationResponseEventName body:body];
    completionHandler();
}

#pragma mark Channel Registration Events

- (void)channelRegistrationSucceeded:(NSNotification *)notification {
    NSMutableDictionary *registrationBody = [NSMutableDictionary dictionary];

    NSString *channelID = UAirship.channel.identifier;
    NSString *deviceToken = [UAirship push].deviceToken;

    [registrationBody setValue:channelID forKey:@"channelId"];
    [registrationBody setValue:deviceToken forKey:@"registrationToken"];
    [self.eventEmitter sendEventWithName:UARCTRegistrationEventName body:registrationBody];
}

#pragma mark -
#pragma mark UARegistrationDelegate

- (void)notificationAuthorizedSettingsDidChange:(UAAuthorizedNotificationSettings)authorizedSettings {
    NSDictionary *body = @{
        @"optIn": @(authorizedSettings != UAAuthorizedNotificationSettingsNone),
        @"authorizedNotificationSettings": [UARCTUtils authorizedSettingsDictionary:authorizedSettings],
        @"authorizedSettings": [UARCTUtils authorizedSettingsArray:authorizedSettings]
    };
    [self.eventEmitter sendEventWithName:UARCTOptInStatusChangedEventName body:body];
}

#pragma mark -
#pragma mark Message Center

- (void)displayMessageCenterAnimated:(BOOL)animated {
    if (UARCTStorage.autoLaunchMessageCenter) {
        [[UAMessageCenter shared].defaultUI displayMessageCenterAnimated:animated];
    } else {
        [self.eventEmitter sendEventWithName:UARCTShowInboxEventName body:@{}];
    }
}

- (void)displayMessageCenterForMessageID:(NSString *)messageID animated:(BOOL)animated {
    if (UARCTStorage.autoLaunchMessageCenter) {
        [[UAMessageCenter shared].defaultUI displayMessageCenterForMessageID:messageID animated:animated];
    } else {
        [self.eventEmitter sendEventWithName:UARCTShowInboxEventName
                                        body:@{ @"messageId": messageID }];
    }
}

- (void)dismissMessageCenterAnimated:(BOOL)animated {
    if (UARCTStorage.autoLaunchMessageCenter) {
        [[UAMessageCenter shared].defaultUI dismissMessageCenterAnimated:animated];
    }
}

- (void)inboxUpdated {
    NSDictionary *body = @{
        @"messageUnreadCount": @([UAMessageCenter shared].messageList.unreadCount),
        @"messageCount": @([UAMessageCenter shared].messageList.messageCount)
    };

    [self.eventEmitter sendEventWithName:UARCTInboxUpdatedEventName body:body];
}

@end

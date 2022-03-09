/* Copyright Urban Airship and Contributors */

#import "UARCTEventEmitter.h"
#import "UARCTUtils.h"

@interface UARCTEventEmitter()
@property(nonatomic, strong) NSMutableArray *pendingEvents;
@end

NSString *const UARCTPendingEventName = @"com.urbanairship.onPendingEvent";

NSString *const UARCTEventNameKey = @"name";
NSString *const UARCTEventBodyKey = @"body";

@implementation UARCTEventEmitter

static UARCTEventEmitter *sharedEventEmitter_;

+ (void)load {
    sharedEventEmitter_ = [[UARCTEventEmitter alloc] init];
}

+ (UARCTEventEmitter *)shared {
    return sharedEventEmitter_;
}

- (instancetype)init {
    self = [super init];
    if (self) {
        self.pendingEvents = [NSMutableArray array];
    }
    return self;
}

- (void)sendEventWithName:(NSString *)eventName {
    @synchronized(self.pendingEvents) {
        [self.pendingEvents addObject:@{ UARCTEventNameKey: eventName }];
        [self notifyPendingEvents];
    }
}

- (void)sendEventWithName:(NSString *)eventName body:(id)body {
    @synchronized(self.pendingEvents) {
        [self.pendingEvents addObject:@{ UARCTEventNameKey: eventName, UARCTEventBodyKey: body}];
        [self notifyPendingEvents];
    }
}

- (void)notifyPendingEvents {
    [self.bridge enqueueJSCall:@"RCTDeviceEventEmitter"
                        method:@"emit"
                          args:@[UARCTPendingEventName]
                    completion:nil];
}

- (NSArray *)takePendingEventsWithType:(NSString *)type {
    @synchronized (self.pendingEvents) {
        NSMutableArray *events = [NSMutableArray array];
        for (id event in [self.pendingEvents copy]) {
            if ([event[UARCTEventNameKey] isEqualToString:type]) {
                [events addObject:event[UARCTEventBodyKey]];
                [self.pendingEvents removeObject:event];
            }
        }
        return events;
    }
}

- (void)onAirshipListenerAddedForType:(NSString *)type {
    @synchronized (self.pendingEvents) {
        for (id event in [self.pendingEvents copy]) {
            if ([event[UARCTEventNameKey] isEqualToString:type]) {
                [self notifyPendingEvents];
                break;
            }
        }
    }
}

@end

/* Copyright 2017 Urban Airship and Contributors */

#import "UARCTMessageCenter.h"

@implementation UARCTMessageCenter
static UARCTMessageCenter *sharedMessageCenterDelegate_;

NSString *const UARCTAutoLaunchMessageCenterKey = @"com.urbanairship.auto_launch_message_center";

NSString *const UARCTStatusMessageNotFound = @"STATUS_MESSAGE_NOT_FOUND";
NSString *const UARCTStatusInboxRefreshFailed = @"STATUS_INBOX_REFRESH_FAILED";
NSString *const UARCTErrorDescriptionMessageNotFound = @"Message not found for provided id.";
NSString *const UARCTErrorDescriptionInboxRefreshFailed = @"Failed to refresh inbox.";

int const UARCTErrorCodeMessageNotFound = 0;
int const UARCTErrorCodeInboxRefreshFailed = 1;

+ (void)load {
    sharedMessageCenterDelegate_ = [[UARCTMessageCenter alloc] init];
}

+ (UARCTMessageCenter *)shared {
    return sharedMessageCenterDelegate_;
}

#pragma mark UAInboxDelegate

- (void)showInboxMessage:(UAInboxMessage *)message {
    if ([[NSUserDefaults standardUserDefaults] boolForKey:UARCTAutoLaunchMessageCenterKey]) {
        [[UAirship defaultMessageCenter] displayMessage:message];
    }
}

- (void)showInbox {
    if ([[NSUserDefaults standardUserDefaults] boolForKey:UARCTAutoLaunchMessageCenterKey]) {
        [[UAirship defaultMessageCenter] display];
    }
}

@end

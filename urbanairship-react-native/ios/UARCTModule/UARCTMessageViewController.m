/* Copyright Urban Airship and Contributors */

#import "UARCTMessageViewController.h"

@implementation UARCTMessageViewController

- (void) viewDidLoad {
    [super viewDidLoad];
    
    UIBarButtonItem *done = [[UIBarButtonItem alloc]
                             initWithBarButtonSystemItem:UIBarButtonSystemItemDone
                             target:self
                             action:@selector(dismissMessageViewController:)];
    
    self.navigationItem.rightBarButtonItem = done;
    self.delegate = self;
}

- (void) dismissMessageViewController:(id)sender {
    [self dismissViewControllerAnimated:true completion:nil];
}

#pragma mark -
#pragma mark UAMessageCenterMessageViewDelegate

- (void)messageLoadStarted:(NSString *)messageID {
    //
}

- (void)messageLoadSucceeded:(NSString *)messageID {
    //
}

- (void)messageLoadFailed:(NSString *)messageID error:(NSError *)error {
    //
}

- (void)messageClosed:(NSString *)messageID {
    [self dismissViewControllerAnimated:true completion:nil];
}

@end

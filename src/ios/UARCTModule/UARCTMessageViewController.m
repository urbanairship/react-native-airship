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
}

- (void) dismissMessageViewController:(id)sender {
    [self dismissViewControllerAnimated:true completion:nil];
}

@end

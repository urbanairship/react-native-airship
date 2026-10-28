/* Copyright Airship and Contributors */

#import "RNAirshipEmbeddedView.h"

#import "RNAirshipBridge.h"

#import "react/renderer/components/RNAirshipSpec/ComponentDescriptors.h"
#import "react/renderer/components/RNAirshipSpec/EventEmitters.h"
#import "react/renderer/components/RNAirshipSpec/Props.h"
#import "react/renderer/components/RNAirshipSpec/RCTComponentViewHelpers.h"


#ifdef RCT_NEW_ARCH_ENABLED
#import <React/RCTFabricComponentsPlugins.h>

using namespace facebook::react;
#endif

@interface RNAirshipEmbeddedView() <RCTRNAirshipEmbeddedViewViewProtocol>
@property (nonatomic, strong)UIView<RNAirshipEmbeddedViewBridge> *wrapper;
@end

@implementation RNAirshipEmbeddedView

#ifdef RCT_NEW_ARCH_ENABLED
- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {
      static const auto defaultProps = std::make_shared<const RNAirshipEmbeddedViewProps>();
        _props = defaultProps;
    }
    return self;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RNAirshipEmbeddedViewComponentDescriptor>();
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    const auto &newProps = *std::static_pointer_cast<const RNAirshipEmbeddedViewProps>(props);
    const auto *old = oldProps ? static_cast<const RNAirshipEmbeddedViewProps *>(oldProps.get()) : nullptr;
    if (!old || old->config != newProps.config) {
        self.config = [NSString stringWithUTF8String:newProps.config.c_str()];
    }
    [self.wrapper setSizeToContent:newProps.sizeToContent];

    [super updateProps:props oldProps:oldProps];
}

- (void)mountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index {
}

- (void)unmountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index {
}
#endif

- (instancetype) init {
    self = [self initWithFrame:CGRectZero];
    if (self) {
        // Scene content reports its own size, which can exceed the box Yoga assigned.
        // Unclipped, a UIView paints that overflow over the app's own views.
        self.clipsToBounds = YES;
        self.wrapper = [[RNAirshipEmbeddedViewBridgeClass() alloc] initWithFrame:self.bounds];
        __weak RNAirshipEmbeddedView *weakSelf = self;
        self.wrapper.onSizeChange = ^(CGFloat height) {
            [weakSelf emitSizeChange:height];
        };
        [self addSubview:self.wrapper];
    }
    return self;
}

- (void)didMoveToSuperview {
    [super didMoveToSuperview];
}

- (void)didMoveToWindow {
    [super didMoveToWindow];
}

- (void)emitSizeChange:(CGFloat)height {
#ifdef RCT_NEW_ARCH_ENABLED
    if (!_eventEmitter) {
        return;
    }
    std::static_pointer_cast<const RNAirshipEmbeddedViewEventEmitter>(_eventEmitter)
        ->onSizeChange({.height = static_cast<double>(height)});
#endif
}

- (void)setConfig:(NSString *)config {
    _config = config;
    __weak RNAirshipEmbeddedView *weakSelf = self;
    [weakSelf.wrapper setConfig:config];
}


- (void)layoutSubviews {
    [super layoutSubviews];
    self.wrapper.frame = self.bounds;
}
@end

#ifdef RCT_NEW_ARCH_ENABLED
Class<RCTComponentViewProtocol>RNAirshipEmbeddedViewCls(void)
{
    return RNAirshipEmbeddedView.class;
}
#endif

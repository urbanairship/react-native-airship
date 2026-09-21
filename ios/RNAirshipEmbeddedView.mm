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
    self.config = [NSString stringWithUTF8String:newProps.config.c_str()];

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
        self.wrapper = [[RNAirshipEmbeddedViewBridgeClass() alloc] initWithFrame:self.bounds];
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

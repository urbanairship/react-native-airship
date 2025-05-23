/* Copyright Airship and Contributors */

#import "RNAirshipEmbeddedView.h"

#if __has_include(<react_native_airship/react_native_airship-Swift.h>)
#import <react_native_airship/react_native_airship-Swift.h>
#else
#import "react_native_airship-Swift.h"
#endif

#import "generated/RNAirshipSpec/ComponentDescriptors.h"
#import "generated/RNAirshipSpec/EventEmitters.h"
#import "generated/RNAirshipSpec/Props.h"
#import "generated/RNAirshipSpec/RCTComponentViewHelpers.h"


#ifdef RCT_NEW_ARCH_ENABLED
#import "RCTFabricComponentsPlugins.h"

using namespace facebook::react;
#endif

@interface RNAirshipEmbeddedView() <RCTRNAirshipEmbeddedViewViewProtocol>
@property (nonatomic, strong)RNAirshipEmbeddedViewWrapper *wrapper;
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
    self.embeddedID = [NSString stringWithUTF8String:newProps.embeddedId.c_str()];

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
        self.wrapper = [[RNAirshipEmbeddedViewWrapper alloc] initWithFrame:self.bounds];
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

- (void)setEmbeddedID:(NSString *)embeddedID {
    _embeddedID = embeddedID;
    __weak RNAirshipEmbeddedView *weakSelf = self;
    [weakSelf.wrapper setEmbeddedID:embeddedID];
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

/* Copyright Airship and Contributors */

#import "RTNAirshipEmbeddedView.h"

#if __has_include(<react_native_airship/react_native_airship-Swift.h>)
#import <react_native_airship/react_native_airship-Swift.h>
#else
#import "react_native_airship-Swift.h"
#endif

#ifdef RCT_NEW_ARCH_ENABLED
#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>
#import <react/renderer/components/RTNAirshipComponents/ComponentDescriptors.h>
#import <react/renderer/components/RTNAirshipComponents/Props.h>
using namespace facebook::react;
#endif

@interface RTNAirshipEmbeddedView()
@property (nonatomic, strong) RTNAirshipEmbeddedViewWrapper *wrapper;
@end

@implementation RTNAirshipEmbeddedView

#ifdef RCT_NEW_ARCH_ENABLED
- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {
        static const auto defaultProps = std::make_shared<const RTNAirshipMessageViewProps>();
        _props = defaultProps;
    }
    return self;
}
#endif



- (instancetype) init {
    self = [self initWithFrame:CGRectZero];
    if (self) {
        self.wrapper = [[RTNAirshipEmbeddedViewWrapper alloc] initWithFrame:self.bounds];
        [self addSubview:self.wrapper];
    }
    return self;
}


#ifdef RCT_NEW_ARCH_ENABLED
+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RTNAirshipMessageViewComponentDescriptor>();
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    const auto &newProps = *std::static_pointer_cast<const RTNAirshipEmbeddedViewProps>(props);
    self.embeddedID = [NSString stringWithUTF8String:newProps.embeddedId.c_str()];

    [super updateProps:props oldProps:oldProps];
}

- (void)mountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index {
}

- (void)unmountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index {
}
#else

- (void)didMoveToSuperview {
    [super didMoveToSuperview];
}

- (void)didMoveToWindow {
    [super didMoveToWindow];
}

#endif



- (void)setEmbeddedID:(NSString *)embeddedID {
    _embeddedID = embeddedID;
    __weak RTNAirshipEmbeddedView *weakSelf = self;
    [weakSelf.wrapper setEmbeddedID:embeddedID];
}


- (void)layoutSubviews {
    [super layoutSubviews];
    self.wrapper.frame = self.bounds;
}
@end

#ifdef RCT_NEW_ARCH_ENABLED
Class<RCTComponentViewProtocol> RTNAirshipEmbeddedViewCls(void)
{
    return RTNAirshipEmbeddedView.class;
}
#endif

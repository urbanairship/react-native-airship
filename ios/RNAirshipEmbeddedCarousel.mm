/* Copyright Airship and Contributors */

#import "RNAirshipEmbeddedCarousel.h"

#import "RNAirshipBridge.h"

#import "react/renderer/components/RNAirshipSpec/ComponentDescriptors.h"
#import "react/renderer/components/RNAirshipSpec/EventEmitters.h"
#import "react/renderer/components/RNAirshipSpec/Props.h"
#import "react/renderer/components/RNAirshipSpec/RCTComponentViewHelpers.h"

#ifdef RCT_NEW_ARCH_ENABLED
#import <React/RCTFabricComponentsPlugins.h>

using namespace facebook::react;
#endif

@interface RNAirshipEmbeddedCarousel() <RCTRNAirshipEmbeddedCarouselViewProtocol, RNAirshipEmbeddedCarouselWrapperDelegate>
@property (nonatomic, strong) UIView<RNAirshipEmbeddedCarouselBridge> *wrapper;
@end

@implementation RNAirshipEmbeddedCarousel

#ifdef RCT_NEW_ARCH_ENABLED
// Needed because of this: https://github.com/facebook/react-native/pull/37274
+ (void)load
{
  [super load];
}

- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {
        static const auto defaultProps = std::make_shared<const RNAirshipEmbeddedCarouselProps>();
        _props = defaultProps;
    }
    return self;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RNAirshipEmbeddedCarouselComponentDescriptor>();
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    const auto &newProps = *std::static_pointer_cast<const RNAirshipEmbeddedCarouselProps>(props);
    self.config = [NSString stringWithUTF8String:newProps.config.c_str()];
    self.page = newProps.page;

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
        self.wrapper = [[RNAirshipEmbeddedCarouselBridgeClass() alloc] initWithFrame:self.bounds];
        self.wrapper.delegate = self;
        [self addSubview:self.wrapper];
    }
    return self;
}

- (void)setConfig:(NSString *)config {
    _config = config;
    [self.wrapper setConfig:config];
}

- (void)setPage:(NSInteger)page {
    _page = page;
    [self.wrapper setPage:page];
}

- (void)layoutSubviews {
    [super layoutSubviews];
    self.wrapper.frame = self.bounds;
}

- (void)onCarouselStateChangedWithCurrentPage:(NSInteger)currentPage
                                    pageCount:(NSInteger)pageCount
                                  isAvailable:(BOOL)isAvailable {
#ifdef RCT_NEW_ARCH_ENABLED
    auto emitter = std::dynamic_pointer_cast<const facebook::react::RNAirshipEmbeddedCarouselEventEmitter>(_eventEmitter);
    if (emitter) {
        emitter->onStateChange(facebook::react::RNAirshipEmbeddedCarouselEventEmitter::OnStateChange{
            .currentPage = (int)currentPage,
            .pageCount = (int)pageCount,
            .isAvailable = (bool)isAvailable
        });
    }
#else
    if (self.onStateChange) {
        self.onStateChange(@{
            @"currentPage": @(currentPage),
            @"pageCount": @(pageCount),
            @"isAvailable": @(isAvailable)
        });
    }
#endif
}

@end

#ifdef RCT_NEW_ARCH_ENABLED
Class<RCTComponentViewProtocol>RNAirshipEmbeddedCarouselCls(void)
{
    return RNAirshipEmbeddedCarousel.class;
}
#endif

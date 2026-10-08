// @ts-ignore
import { codegenNativeComponent, type HostComponent, type ViewProps } from 'react-native';
import type {
  BubblingEventHandler,
  Int32,
  // @ts-ignore
} from 'react-native/Libraries/Types/CodegenTypes';

type CarouselStateChangeEvent = Readonly<{
  currentPage: Int32;
  pageCount: Int32;
  isAvailable: boolean;
}>;

interface NativeProps extends ViewProps {
  config: string;
  /**
   * Requested page. Negative values mean no page is requested.
   */
  page: Int32;
  onStateChange: BubblingEventHandler<
    CarouselStateChangeEvent,
    'topAirshipEmbeddedCarouselStateChange'
  >;
}

export default codegenNativeComponent<NativeProps>('RNAirshipEmbeddedCarousel') as HostComponent<NativeProps>;

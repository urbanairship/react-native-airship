// @ts-ignore
import { codegenNativeComponent, type HostComponent, type ViewProps } from 'react-native';
import type {
  BubblingEventHandler,
  Double,
  WithDefault,
  // @ts-ignore
} from 'react-native/Libraries/Types/CodegenTypes';

type EmbeddedSizeChangeEvent = Readonly<{
  /**
   * The content's measured height, in points.
   */
  height: Double;
}>;

interface NativeProps extends ViewProps {
  config: string;

  /**
   * Whether the view measures its own content and reports the height, rather
   * than filling the box it is given.
   */
  sizeToContent?: WithDefault<boolean, false>;

  /**
   * Called whenever the measured content height changes. Only emitted while
   * `sizeToContent` is set.
   */
  onSizeChange?: BubblingEventHandler<
    EmbeddedSizeChangeEvent,
    'topAirshipEmbeddedViewSizeChange'
  >;
}

export default codegenNativeComponent<NativeProps>('RNAirshipEmbeddedView') as HostComponent<NativeProps>;

// @ts-ignore
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { ViewProps } from 'react-native';
import type {
  BubblingEventHandler,
  // @ts-ignore
} from 'react-native/Libraries/Types/CodegenTypes';

// type PreferenceCenterLoadStartedEvent = Readonly<{
//   preferenceCenterId: string;
// }>;

// type PreferenceCenterLoadFinishedEvent = Readonly<{
//   preferenceCenterId: string;
// }>;

// type PreferenceCenterLoadErrorEvent = Readonly<{
//   preferenceCenterId: string;
//   retryable: boolean;
//   error: string;
// }>;

// type PreferenceCenterClosedEvent = Readonly<{
//   preferenceCenterId: string;
// }>;

interface PreferenceCenterNativeProps extends ViewProps {
  preferenceCenterId: string;
  // onLoadStarted: BubblingEventHandler<
  //   PreferenceCenterLoadStartedEvent,
  //   'topLoadStarted'
  // >;
  // onLoadFinished: BubblingEventHandler<
  //   PreferenceCenterLoadFinishedEvent,
  //   'topLoadFinished'
  // >;
  // onLoadError: BubblingEventHandler<
  //   PreferenceCenterLoadErrorEvent,
  //   'topLoadError'
  // >;
  // onClose: BubblingEventHandler<
  //   PreferenceCenterClosedEvent, 
  //   'topClose'
  // >;
}

//export default codegenNativeComponent<PreferenceCenterNativeProps>('RTNAirshipPreferenceCenterView');

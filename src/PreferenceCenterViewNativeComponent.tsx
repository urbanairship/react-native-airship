// @ts-ignore
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { ViewProps } from 'react-native';


interface NativeProps extends ViewProps {
  preferenceCenterId: string;
}

export default codegenNativeComponent<NativeProps>('RTNAirshipPreferenceCenterView');

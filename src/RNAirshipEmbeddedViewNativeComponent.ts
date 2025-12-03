// @ts-ignore
import { codegenNativeComponent, type HostComponent, type ViewProps } from 'react-native';

interface NativeProps extends ViewProps {
  embeddedId: string;
}

export default codegenNativeComponent<NativeProps>('RNAirshipEmbeddedView') as HostComponent<NativeProps>;

// @ts-ignore
import { codegenNativeComponent, type HostComponent, type ViewProps } from 'react-native';
import type {
  WithDefault,
  // @ts-ignore
} from 'react-native/Libraries/Types/CodegenTypes';

interface NativeProps extends ViewProps {
  embeddedId: string;
  selectionType?: WithDefault<'priority' | 'instance_id', 'priority'>;
  selectionInstanceId?: string;
}

export default codegenNativeComponent<NativeProps>('RNAirshipEmbeddedView') as HostComponent<NativeProps>;

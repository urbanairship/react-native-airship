// @ts-ignore
import { codegenNativeComponent, type HostComponent, type ViewProps } from 'react-native';
import type {
  BubblingEventHandler,
  // @ts-ignore
} from 'react-native/Libraries/Types/CodegenTypes';

type MessageLoadStartedEvent = Readonly<{
  messageId: string;
}>;

type MessageLoadFinishedEvent = Readonly<{
  messageId: string;
}>;

type MessageLoadErrorEvent = Readonly<{
  messageId: string;
  retryable: boolean;
  error: string;
}>;

type MessageClosedEvent = Readonly<{
  messageId: string;
}>;

interface NativeProps extends ViewProps {
  messageId: string;
  onLoadStarted: BubblingEventHandler<
    MessageLoadStartedEvent,
    'topLoadStarted'
  >;
  onLoadFinished: BubblingEventHandler<
    MessageLoadFinishedEvent,
    'topLoadFinished'
  >;
  onLoadError: BubblingEventHandler<MessageLoadErrorEvent, 'topLoadError'>;
  onClose: BubblingEventHandler<MessageClosedEvent, 'topClose'>;
}

export default codegenNativeComponent<NativeProps>('RNAirshipMessageView') as HostComponent<NativeProps>;
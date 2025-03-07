// @ts-ignore
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { HostComponent, ViewProps } from 'react-native';
import type { BubblingEventHandler } from 'react-native/Libraries/Types/CodegenTypes';


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
  onLoadStarted?: BubblingEventHandler<MessageLoadStartedEvent> | null;
  onLoadFinished?: BubblingEventHandler<MessageLoadFinishedEvent> | null;
  onLoadError?: BubblingEventHandler<MessageLoadErrorEvent> | null;
  onClose?: BubblingEventHandler<MessageClosedEvent> | null;
}

export default codegenNativeComponent<NativeProps>('RNAirshipMessageView') as HostComponent<NativeProps>;

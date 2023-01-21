import { NativeModules } from 'react-native';
import { AirshipRoot } from './AirshipRoot';

export * from './types';
export * from './MessageView';
export { Subscription } from './UAEventEmitter';

// @ts-expect-error
const isTurboModuleEnabled = global.__turboModuleProxy != null;

const AirshipModule = isTurboModuleEnabled
  ? require('./NativeRTNAirship').default
  : NativeModules.RTNAirship;

const sharedAirship = new AirshipRoot(AirshipModule);

const Airship = sharedAirship;
export default Airship;

import { NativeModules } from 'react-native';
import { AirshipRoot } from './AirshipRoot';

export { AirshipRoot } from './AirshipRoot';
export { AirshipActions } from './AirshipActions';
export { AirshipAnalytics } from './AirshipAnalytics';
export { AirshipChannel } from './AirshipChannel';
export { AirshipContact } from './AirshipContact';
export { AirshipInApp } from './AirshipInApp';
export { AirshipLocale } from './AirshipLocale';
export { AirshipMessageCenter } from './AirshipMessageCenter';
export { AirshipPreferenceCenter } from './AirshipPreferenceCenter';
export { AirshipPrivacyManager } from './AirshipPrivacyManager';
export { AirshipPush } from './AirshipPush';

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

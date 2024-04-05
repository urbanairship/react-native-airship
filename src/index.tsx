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
export { AirshipFeatureFlagManager } from './AirshipFeatureFlagManager';

export { AirshipPush, AirshipPushAndroid, AirshipPushIOS } from './AirshipPush';
export { CustomEvent } from './CustomEvent';
export { SubscriptionListEditor } from './SubscriptionListEditor';
export { TagGroupEditor } from './TagGroupEditor';
export { ScopedSubscriptionListEditor } from './ScopedSubscriptionListEditor';
export { AttributeEditor } from './AttributeEditor';
export { Action } from './Action';

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

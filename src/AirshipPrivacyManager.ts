import { Feature } from './types';

export class AirshipPrivacyManager {
  constructor(private readonly module: any) {}

  public setEnabledFeatures(features: Feature[]): Promise<void> {
    return this.module.privacyManagerSetEnabledFeatures(features);
  }

  public getEnabledFeatures(): Promise<Feature[]> {
    return this.module.privacyManagerGetEnabledFeatures();
  }

  public enableFeatures(features: Feature[]): Promise<void> {
    return this.module.privacyManagerEnableFeature(features);
  }

  public disableFeatures(features: Feature[]): Promise<void> {
    return this.module.privacyManagerDisableFeature(features);
  }

  public isFeaturesEnabled(features: Feature[]): Promise<void> {
    return this.module.privacyManagerIsFeatureEnabled(features);
  }
}

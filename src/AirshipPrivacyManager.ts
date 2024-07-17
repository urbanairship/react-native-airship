import { Feature } from './types';

/**
 * Airship Privacy Manager.
 */
export class AirshipPrivacyManager {
  constructor(private readonly module: any) {}

  /**
   * Sets the current set of enabled features.
   * @param features The features to set.
   * @returns A promise.
   */
  public setEnabledFeatures(features: Feature[]): Promise<void> {
    return this.module.privacyManagerSetEnabledFeatures(
      features.filter(feature =>
        feature !== Feature.Location && feature !== Feature.Chat
      )
    );
  }
  /**
   * Gets the current enabled features.
   * @returns A promise with the result.
   */
  public getEnabledFeatures(): Promise<Feature[]> {
    return this.module.privacyManagerGetEnabledFeatures();
  }

  /**
   * Enables additional features.
   * @param features The features to enable.
   * @returns A promise.
   */
  public enableFeatures(features: Feature[]): Promise<void> {
    return this.module.privacyManagerEnableFeature(
      features.filter(feature =>
        feature !== Feature.Location && feature !== Feature.Chat
      )
    );
  }

  /**
   * Disable features.
   * @param features The features to disable.
   * @returns A promise.
   */
  public disableFeatures(features: Feature[]): Promise<void> {
    return this.module.privacyManagerDisableFeature(
      features.filter(feature =>
        feature !== Feature.Location && feature !== Feature.Chat
      )
    );
  }

  /**
   * Checks if the features are enabled or not.
   * @param features The features to check.
   * @returns A promise with the result.
   */
  public isFeaturesEnabled(features: Feature[]): Promise<void> {
    return this.module.privacyManagerIsFeatureEnabled(
      features.filter(feature =>
        feature !== Feature.Location && feature !== Feature.Chat
      )
    );
  }
}

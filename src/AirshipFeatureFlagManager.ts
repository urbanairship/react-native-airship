import { FeatureFlag } from './types';

/**
 * Airship feature flag manager.
 */
export class AirshipFeatureFlagManager {
  constructor(private readonly module: any) {}

 /**
   * Retrieve a given flag's status and associated data by its name.
   * @param {string} flagName the flag name
   * @return {Promise<FeatureFlag>} A promise resolving to the feature flag
   *   requested.
   * @throws {Error} when failed to fetch
   */
  public flag(
    flagName: string
  ): Promise<FeatureFlag> {
    return this.module.featureFlagManagerFlag(flagName);
  }
}

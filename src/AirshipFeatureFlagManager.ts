import { FeatureFlag } from './types';

/**
 * Airship feature flag manager.
 */
export class AirshipFeatureFlagManager {
  /**
   * Feature flag cache.
   */
  public readonly resultCache: AirshipFeatureFlagResultCache;

  constructor(private readonly module: any) {
    this.resultCache = new AirshipFeatureFlagResultCache(module);
  }

  /**
   * Retrieve a given flag's status and associated data by its name.
   * @param {string} flagName The flag name
   * @param {boolean} useResultCache If the response should use result cache or not.
   * @return {Promise<FeatureFlag>} A promise resolving to the feature flag requested.
   * @throws {Error} when failed to fetch
   */
  public flag(
    flagName: string,
    useResultCache: boolean = true
  ): Promise<FeatureFlag> {
    return this.module.featureFlagManagerFlag(flagName, useResultCache);
  }

  /**
   * Tracks a feature flag interaction event.
   * @param {FeatureFlag} flag The flag
   * @return {Promise<Void>} A promise with an empty result.
   * @throws {Error} when failed to fetch
   */
  public trackInteraction(flag: FeatureFlag): Promise<void> {
    return this.module.featureFlagManagerTrackInteraction(flag);
  }
}

export class AirshipFeatureFlagResultCache {
  constructor(private readonly module: any) {}

  /**
   * Retrieve a flag from the cache.
   * @param {string} flagName The flag name
   * @return {Promise<FeatureFlag>} A promise resolving to the feature flag.
   */
  public flag(flagName: string): Promise<FeatureFlag> {
    return this.module.featureFlagManagerResultCacheGetFlag(flagName);
  }

  /**
   * Caches a feature flag.
   * @param {FeatureFlag} flag The flag
   * @param {FeatureFlag} ttl Cache TTL in milliseconds.
   * @return {Promise<Void>} A promise with an empty result.
   */
  public cache(flag: FeatureFlag, ttl: number): Promise<void> {
    return this.module.featureFlagManagerResultCacheSetFlag(flag, ttl);
  }

  /**
   * Clears the cache for a given flag.
   * @param {FeatureFlag} flagName The flag name
   * @return {Promise<Void>} A promise with an empty result.
   */
  public removeCachedFlag(flagName: string): Promise<void> {
    return this.module.featureFlagManagerResultCacheRemoveFlag(flagName);
  }
}

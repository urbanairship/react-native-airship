import { CustomEvent } from "./types";

/**
 * Airship analytics.
 */
export class AirshipAnalytics {
  constructor(private readonly module: any) {}

  /**
   * Associates an identifier.
   * 
   * @param key The key.
   * @param identifier The identifier. `null` to remove.
   * @returns A promise.
   */
  public associateIdentifier(key: string, identifier?: string): Promise<void> {
    return this.module.analyticsAssociateIdentifier(key, identifier);
  }

  /**
   * Tracks a screen.
   * @param screen The screen. `null` to stop tracking.
   * @returns A promise.
   */
  public trackScreen(screen?: string): Promise<void> {
    return this.module.analyticsTrackScreen(screen);
  }

  /**
   * Adds a custom event.
   * @param event The custom event.
   * @return A promise that returns null if resolved, or an Error if the
   * custom event is rejected.
   */
  public addCustomEvent(event: CustomEvent): Promise<void> {
    return this.module.addCustomEvent(event);
  }
}

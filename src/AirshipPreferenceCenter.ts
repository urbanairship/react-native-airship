import { PreferenceCenter } from './types';

/**
 * Airship Preference Center.
 */
export class AirshipPreferenceCenter {
  constructor(private readonly module: any) {}

  /**
   * Requests to display a preference center.
   * 
   * Will either emit an event to display the 
   * Preference Center if auto launch is disabled, 
   * or display the OOTB UI.
   * @param preferenceCenterId The preference center Id.
   * @returns A promise.
   */
  public display(preferenceCenterId: string): Promise<void> {
    return this.module.preferenceCenterDisplay(preferenceCenterId);
  }

  /**
   * Gets the preference center config.
   * @param preferenceCenterId The preference center Id.
   * @returns A promise with the result.
   */
  public getConfig(preferenceCenterId: string): Promise<PreferenceCenter> {
    return this.module.preferenceCenterGetConfig(preferenceCenterId);
  }

   /**
   * Enables or disables showing the OOTB UI when requested to display by either
   * `display` or by a notification with some other action.
   * @param preferenceCenterId The preference center Id.
   * @param autoLaunch true to show OOTB UI, false to emit events.
   */
  public setAutoLaunchDefaultPreferenceCenter(
    preferenceCenterId: string,
    autoLaunch: boolean
  ): void {
    return this.module.preferenceCenterAutoLaunchDefaultPreferenceCenter(
      preferenceCenterId,
      autoLaunch
    );
  }
}

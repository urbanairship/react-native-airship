import { PreferenceCenter } from './types';

export class AirshipPreferenceCenter {
  constructor(private readonly module: any) {}

  public display(preferenceCenterId: string): Promise<void> {
    return this.module.preferenceCenterDisplay(preferenceCenterId);
  }

  public getConfig(preferenceCenterId: string): Promise<PreferenceCenter> {
    return this.module.preferenceCenterGetConfig(preferenceCenterId);
  }

  public setAutoLaunchDefaultPreferenceCenter(
    preferenceCenterId: string,
    autoLaunch: Boolean
  ): void {
    return this.module.preferenceCenterAutoLaunchDefaultPreferenceCenter(
      preferenceCenterId,
      autoLaunch
    );
  }
}

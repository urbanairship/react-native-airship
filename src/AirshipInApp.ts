export class AirshipInApp {
  constructor(private readonly module: any) {}

  public setPaused(paused: boolean): Promise<void> {
    return this.module.inAppSetPaused(paused);
  }

  public isPaused(): Promise<boolean> {
    return this.module.inAppIsPaused();
  }

  public setDisplayInterval(milliseconds: number): Promise<void> {
    return this.module.inAppSetDisplayInterval(milliseconds);
  }

  public getDisplayInterval(): Promise<number> {
    return this.module.inAppGetDisplayInterval();
  }
}

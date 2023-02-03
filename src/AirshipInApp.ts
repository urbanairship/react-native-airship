/**
 * Airship InApp Experiences.
 */
export class AirshipInApp {
  constructor(private readonly module: any) {}

  /**
   * Pauses messages.
   * @param paused `true` to pause, `false` to resume.
   * @returns A promise.
   */
  public setPaused(paused: boolean): Promise<void> {
    return this.module.inAppSetPaused(paused);
  }

  /**
   * Checks if messages are paused.
   * @returns A promise with the result.
   */
  public isPaused(): Promise<boolean> {
    return this.module.inAppIsPaused();
  }

  /**
   * Sets the display interval for messages.
   * @param milliseconds Display interval
   * @returns A promise.
   */
  public setDisplayInterval(milliseconds: number): Promise<void> {
    return this.module.inAppSetDisplayInterval(milliseconds);
  }

  /**
   * Gets the display interval.
   * @returns A promise with the result.
   */
  public getDisplayInterval(): Promise<number> {
    return this.module.inAppGetDisplayInterval();
  }
}

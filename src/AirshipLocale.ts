/**
 * Manages locale used by Airship messaging.
 */
export class AirshipLocale {
  constructor(private readonly module: any) {}

  /**
   * Sets the locale override.
   * @param localeIdentifier The locale identifier.
   * @returns A promise.
   */
  public setLocaleOverride(localeIdentifier: string): Promise<void> {
    return this.module.localeSetLocaleOverride(localeIdentifier);
  }

  /**
   * Clears the locale override.
   * @returns A promise.
   */
  public clearLocaleOverride(): Promise<void> {
    return this.module.localeClearLocaleOverride();
  }

  /**
   * Gets the current locale.
   * @returns A promise with the result.
   */
  public getLocale(): Promise<string> {
    return this.module.localeGetLocale();
  }
}

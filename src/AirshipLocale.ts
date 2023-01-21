export class AirshipLocale {
  constructor(private readonly module: any) {}

  public setLocaleOverride(localeIdentifier: string): Promise<void> {
    return this.module.localeSetLocaleOverride(localeIdentifier);
  }

  public clearLocaleOverride(): Promise<void> {
    return this.module.localeClearLocaleOverride();
  }

  public getLocale(): Promise<string> {
    return this.module.localeGetLocale();
  }
}

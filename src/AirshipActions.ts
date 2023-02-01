import { JsonValue } from './types';

export class AirshipActions {
  constructor(private readonly module: any) {}

  public run(
    actionName: string,
    actionValue?: JsonValue
  ): Promise<JsonValue | null | undefined> {
    return this.module.actionRun(actionName, actionValue);
  }
}

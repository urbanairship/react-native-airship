import { JsonValue } from './types';
import type { Spec } from './NativeRNAirship';

/**
 * Airship actions.
 */
export class AirshipActions {
  constructor(private readonly module: Spec) {}

  /**
   * Runs an Airship action.
   *
   * @param actionName The name of the action.
   * @param actionValue The action's value.
   * @return A promise that returns the action result if the action
   * successfully runs, or the Error if the action was unable to be run.
   */
  public run(
    actionName: string,
    actionValue?: JsonValue
  ): Promise<JsonValue | null | undefined> {
    return this.module.actionRun({
      name: actionName,
      value: actionValue,
    }) as Promise<JsonValue | undefined>;
  }
}

import { JsonValue } from './types';
import { Action } from './Action';

/**
 * Airship actions.
 */
export class AirshipActions {
  constructor(private readonly module: any) {}

  /**
   * Runs an Airship action.
   *
   * @param action The Airship Action.
   * @return A promise that returns the action result if the action
   * successfully runs, or the Error if the action was unable to be run.
   */
  public run(
    action: Action
  ): Promise<JsonValue | null | undefined> {
    return this.module.actionRun(action);
  }
}

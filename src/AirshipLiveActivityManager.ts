import {
  LiveActivity,
  LiveActivityListRequest,
  LiveActivityStartRequest,
  LiveActivityUpdateRequest,
  LiveActivityEndRequest,
} from './types';
import type { Spec } from './NativeRNAirship';

/**
 * Live Activity manager.
 */
export class AirshipLiveActivityManager {
  constructor(private readonly module: Spec) {}

  /**
   * Lists any Live Activities for the request.
   * @param request The request options.
   * @returns A promise with the result.
   */
  public list(request: LiveActivityListRequest): Promise<LiveActivity[]> {
    return this.module.liveActivityList(request) as Promise<LiveActivity[]>;
  }

  /**
   * Lists all Live Activities.
   * @returns A promise with the result.
   */
  public listAll(): Promise<LiveActivity[]> {
    return this.module.liveActivityListAll() as Promise<LiveActivity[]>;
  }

  /**
   * Starts a Live Activity.
   * @param request The request options.
   * @returns A promise with the result.
   */
  public start(request: LiveActivityStartRequest): Promise<LiveActivity> {
    return this.module.liveActivityStart(request) as Promise<LiveActivity>;
  }

  /**
   * Updates a Live Activity.
   * @param request The request options.
   * @returns A promise with the result.
   */
  public update(request: LiveActivityUpdateRequest): Promise<void> {
    return this.module.liveActivityUpdate(request);
  }

  /**
   * Ends a Live Activity.
   * @param request The request options.
   * @returns A promise with the result.
   */
  public end(request: LiveActivityEndRequest): Promise<void> {
    return this.module.liveActivityEnd(request);
  }
}

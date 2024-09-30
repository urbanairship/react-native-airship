import {
  LiveActivity,
  LiveActivityListRequest,
  LiveActivityCreateRequest,
  LiveActivityUpdateRequest,
  LiveActivityEndRequest,
} from './types';

/**
 * Live Activity manager.
 */
export class AirshipLiveActivityManager {
  constructor(private readonly module: any) {}

  /**
   * Lists any Live Activities for the request.
   * @param request The request options.
   * @returns A promise with the result.
   */
  public list(request: LiveActivityListRequest): Promise<LiveActivity[]> {
    return this.module.liveActivityList(request);
  }

  /**
   * Creates a Live Activity.
   * @param request The request options.
   * @returns A promise with the result.
   */
  public create(request: LiveActivityCreateRequest): Promise<LiveActivity[]> {
    return this.module.liveActivityCreate(request);
  }

  /**
   * Updates a Live Activity.
   * @param request The request options.
   * @returns A promise with the result.
   */
  public update(request: LiveActivityUpdateRequest): Promise<LiveActivity[]> {
    return this.module.liveActivityUpdate(request);
  }

  /**
   * Ends a Live Activity.
   * @param request The request options.
   * @returns A promise with the result.
   */
  public end(request: LiveActivityEndRequest): Promise<LiveActivity[]> {
    return this.module.liveActivityEnd(request);
  }
}

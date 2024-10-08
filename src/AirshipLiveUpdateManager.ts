import {
  LiveUpdate,
  LiveUpdateListRequest,
  LiveUpdateStartRequest,
  LiveUpdateUpdateRequest,
  LiveUpdateEndRequest,
} from './types';

/**
 * Live Update manager.
 */
export class AirshipLiveUpdateManager {
  constructor(private readonly module: any) {}

  /**
   * Lists any Live Updates for the request.
   * @param request The request options.
   * @returns A promise with the result.
   */
  public list(request: LiveUpdateListRequest): Promise<LiveUpdate[]> {
    return this.module.liveUpdateList(request);
  }

  /**
   * Lists all Live Updates.
   * @returns A promise with the result.
   */
  public listAll(): Promise<LiveUpdate[]> {
    return this.module.liveUpdateListAll();
  }

  /**
   * Starts a Live Update.
   * @param request The request options.
   * @returns A promise with the result.
   */
  public start(request: LiveUpdateStartRequest): Promise<void> {
    return this.module.liveUpdateStart(request);
  }

  /**
   * Updates a Live Update.
   * @param request The request options.
   * @returns A promise with the result.
   */
  public update(request: LiveUpdateUpdateRequest): Promise<void> {
    return this.module.liveUpdateUpdate(request);
  }

  /**
   * Ends a Live Update.
   * @param request The request options.
   * @returns A promise with the result.
   */
  public end(request: LiveUpdateEndRequest): Promise<void> {
    return this.module.liveUpdateEnd(request);
  }

  /**
   * Clears all Live Updates.
   * @returns A promise with the result.
   */
  public clearAll(): Promise<void> {
    return this.module.liveUpdateClearAll();
  }
}


import {
  LiveActivity,
  LiveActivityListRequest,
  LiveActivityCreateRequest,
  LiveActivityUpdateRequest,
  LiveActivityEndRequest,
} from './types';

export class AirshipLiveActivityManager {
  constructor(private readonly module: any) {}

  public list(request: LiveActivityListRequest): Promise<LiveActivity[]> {
    return this.module.liveActivityList(request);
  }

  public create(request: LiveActivityCreateRequest): Promise<LiveActivity[]> {
    return this.module.liveActivityCreate(request);
  }

  public update(request: LiveActivityUpdateRequest): Promise<LiveActivity[]> {
    return this.module.liveActivityUpdate(request);
  }

  public end(request: LiveActivityEndRequest): Promise<LiveActivity[]> {
    return this.module.liveActivityEnd(request);
  }
}

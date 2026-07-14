import { Subscription, UAEventEmitter } from './UAEventEmitter';
import { JsonObject } from './types';


/**
 * Info for a pending embedded content instance.
 */
export interface PendingEmbedded {
  /**
   * The embedded Id.
   */
  embeddedId: string;

  /**
   * The instance Id of this specific pending content.
   */
  instanceId: string;

  /**
   * The priority. Lower numbers are higher priority.
   */
  priority: number;

  /**
   * The extras.
   */
  extras: JsonObject;
}

/**
 * Airship InApp Experiences.
 */
export class AirshipInApp {
  private pendingEmbeddedReady: Map<string, { embeddedId: string }[]> = new Map()
  private pendingEmbeddedListeners: Map<string, ((pending: { embeddedId: string }[]) => any)[]> = new Map();
  private embeddedInfo: Map<string, PendingEmbedded[]> = new Map()

  constructor(private readonly module: any, private readonly eventEmitter: UAEventEmitter) {
    this.eventEmitter.addListener("com.airship.pending_embedded_updated", (event) => {
      let pending = event["pending"] as { embeddedId: string }[];

      this.pendingEmbeddedReady = pending.reduce((map, entry) => {
        var embeddedId = entry.embeddedId
        if (!map.has(embeddedId)) {
          map.set(embeddedId, [entry])
        } else {
          map.get(embeddedId)?.push(entry)
        }
        return map
      }, new Map<string, { embeddedId: string }[]>());


      this.pendingEmbeddedListeners.forEach((listeners, embeddedId) => {
        let pending = this.pendingEmbeddedReady.get(embeddedId);
        listeners.forEach((listener) => { listener(pending ?? []) });
      });
    });

    this.eventEmitter.addListener("com.airship.iax.pending_embedded_info_updated", (event) => {
      let pending = event["pending"] as PendingEmbedded[];

      this.embeddedInfo = pending.reduce((map, entry) => {
        if (!map.has(entry.embeddedId)) {
          map.set(entry.embeddedId, [entry])
        } else {
          map.get(entry.embeddedId)?.push(entry)
        }
        return map
      }, new Map<string, PendingEmbedded[]>());
    });

    module.inAppResendPendingEmbeddedEvent();
  }

  /**
   * Gets the pending embedded content info for the given embedded ID.
   * @param embeddedId The embedded ID to check.
   * @returns The pending embedded content info, including instance ID and extras.
   */
  public getPendingEmbedded(embeddedId: string): PendingEmbedded[] {
    return this.embeddedInfo.get(embeddedId) ?? [];
  }

  /**
   * Adds a listener to listen for if an embedded ID is ready to display or not.
   * @param embeddedId The embedded ID to check.
   * @param listener  The listener.
   * @returns A subscription that can be used to cancel the listener.
   */
  public addEmbeddedReadyListener(embeddedId: string, listener: (isReady: boolean) => void): Subscription {    
    var currentValue = this.isEmbeddedReady(embeddedId);
    listener(currentValue);

    let wrappedListener = (pending: { embeddedId: string }[]) => {
      var nextValue = pending.length > 0;
      if (currentValue != nextValue) {
        listener(nextValue);
      }
      currentValue = nextValue;
    }

    if (!this.pendingEmbeddedListeners.has(embeddedId)) {
      this.pendingEmbeddedListeners.set(embeddedId, [wrappedListener]);
    } else {
      this.pendingEmbeddedListeners.get(embeddedId)?.push(wrappedListener);
    }

    return new Subscription(() => {
      this.pendingEmbeddedListeners.set(embeddedId, this.pendingEmbeddedListeners.get(embeddedId)?.filter((obj) => obj !== wrappedListener) ?? []);
    });
  }

  /**
   * Checks if embedded message is ready for the given ID.
   * @param embeddedId The embedded ID to check.
   * @returns `true` if one is ready, otherwise `false`.
   */
  public isEmbeddedReady(embeddedId: string): boolean {
    return (this.pendingEmbeddedReady.get(embeddedId)?.length ?? 0) > 0;
  }

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

import { Subscription, UAEventEmitter } from './UAEventEmitter';


interface PendingEmbedded {
  embeddedId: string
}

/**
 * Airship InApp Experiences.
 */
export class AirshipInApp {
  private pendingEmbedded: Map<string, PendingEmbedded[]> = new Map()
  private pendingEmbeddedListeners: Map<string, ((pending: PendingEmbedded[]) => any)[]> = new Map();

  constructor(private readonly module: any, private readonly eventEmitter: UAEventEmitter) {
    this.eventEmitter.addListener("com.airship.pending_embedded_updated", (event) => {
      let pending = event["pending"] as PendingEmbedded[];

      this.pendingEmbedded = pending.reduce((map, entry) => {
        var embeddedId = entry.embeddedId
        if (!map.has(embeddedId)) {
          map.set(embeddedId, [entry])
        } else {
          map.get(embeddedId)?.push(entry)
        }
        return map
      }, new Map<string, PendingEmbedded[]>());


      this.pendingEmbeddedListeners.forEach((listeners, embeddedId) => {
        let pending = this.pendingEmbedded.get(embeddedId);
        listeners.forEach((listener) => { listener(pending ?? []) });
      });
    });

    module.inAppResendPendingEmbeddedEvent();
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

    let wrappedListener = (pending: PendingEmbedded[]) => {
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
    return (this.pendingEmbedded.get(embeddedId)?.length ?? 0) > 0;
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

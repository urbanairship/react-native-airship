/* Copyright Airship and Contributors */

'use strict';

/**
 * Enum of internal subscription list update type.
 * @hidden
 */
enum SubscriptionListUpdateType {
  subscribe = "subscribe",
  unsubscribe = "unsubscribe"
}

/**
 * Subscription list operation.
 * @hidden
 */
export interface SubscriptionListUpdate {
  /**
   * The subscription list identifier.
   */
  listId: string;
  /**
   * The subscription list update type.
   */
  type: SubscriptionListUpdateType;
}

/**
 * Subscription list editor.
 */
export class SubscriptionListEditor {

   onApply: (subscriptionListUpdates: SubscriptionListUpdate[]) => void;
   subscriptionListUpdates: SubscriptionListUpdate[];

  /**
   */
  constructor(onApply: (subscriptionListUpdates: SubscriptionListUpdate[]) => void) {
    this.onApply = onApply;
    this.subscriptionListUpdates = [];
  }

  /**
   * Subscribes to a list.
   *
   * @param subscriptionListId The subscription list identifier.
   */
  subscribe(subscriptionListId: string) {
    const operation = {"listId": subscriptionListId, "type": SubscriptionListUpdateType.subscribe};
    this.subscriptionListUpdates.push(operation);
    return this;
  }

  /**
  * Unsubscribe from a list.
  *
  * @param subscriptionListId The subscription list identifier.
  */
  unsubscribe(subscriptionListId: string) {
    const operation = {"listId": subscriptionListId, "type": SubscriptionListUpdateType.unsubscribe};
    this.subscriptionListUpdates.push(operation);
    return this;
  }

  /**
  * Applies subscription list changes.
  *
  */
  apply() {
    this.onApply(this.subscriptionListUpdates)
  }

}

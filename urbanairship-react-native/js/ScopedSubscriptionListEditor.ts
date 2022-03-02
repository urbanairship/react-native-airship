/* Copyright Airship and Contributors */

'use strict';

import { SubscriptionScope } from "./UrbanAirship";

/**
 * Enum of internal scoped subscription list update type.
 * @hidden
 */
enum ScopedSubscriptionListUpdateType {
  subscribe = "subscribe",
  unsubscribe = "unsubscribe"
}

/**
 * Scoped subscription list operation.
 * @hidden
 */
export interface ScopedSubscriptionListUpdate {
  /**
   * The subscription list identifier.
   */
  listId: string;
  /**
   * The subscription list update type.
   */
  type: ScopedSubscriptionListUpdateType;
  /**
   * The subscription scope to update.
   */
  scope: SubscriptionScope
}

/**
 * Scoped subscription list editor.
 */
export class ScopedSubscriptionListEditor {

   onApply: (subscriptionListUpdates: ScopedSubscriptionListUpdate[]) => void;
   subscriptionListUpdates: ScopedSubscriptionListUpdate[];

  /**
   */
  constructor(onApply: (subscriptionListUpdates: ScopedSubscriptionListUpdate[]) => void) {
    this.onApply = onApply;
    this.subscriptionListUpdates = [];
  }

  /**
   * Subscribes to a list in the given scope.
   *
   * @param subscriptionListId The subscription list identifier.
   * @param scope The subscription scope to subscribe.
   */
  subscribe(subscriptionListId: string, scope: SubscriptionScope) {
    const operation = {"listId": subscriptionListId, "type": ScopedSubscriptionListUpdateType.subscribe, "scope": scope};
    this.subscriptionListUpdates.push(operation);
    return this;
  }

  /**
  * Unsubscribe from a list.
  *
  * @param subscriptionListId The subscription list identifier.
  * @param scope The subscription scope to unsubscribe.
  */
  unsubscribe(subscriptionListId: string, scope: SubscriptionScope) {
    const operation = {"listId": subscriptionListId, "type": ScopedSubscriptionListUpdateType.unsubscribe, "scope": scope};
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

/* Copyright Airship and Contributors */

'use strict';

/**
 * Enum of internal subscription list update type.
 * @hidden
 */
enum SubscriptionListOperationAction {
  subscribe = 'subscribe',
  unsubscribe = 'unsubscribe',
}

/**
 * Subscription list operation.
 * @hidden
 */
export interface SubscriptionListOperation {
  /**
   * The subscription list identifier.
   */
  listId: string;
  /**
   * The subscription list update type.
   */
  action: SubscriptionListOperationAction;
}

/**
 * Subscription list editor.
 */
export class SubscriptionListEditor {
  private operations: SubscriptionListOperation[] = [];

  constructor(
    private readonly onApply: (
      subscriptionListUpdates: SubscriptionListOperation[]
    ) => Promise<void>
  ) {}

  /**
   * Subscribes to a list.
   *
   * @param subscriptionListId The subscription list identifier.
   */
  subscribe(subscriptionListId: string) {
    const operation = {
      listId: subscriptionListId,
      action: SubscriptionListOperationAction.subscribe,
    };
    this.operations.push(operation);
    return this;
  }

  /**
   * Unsubscribe from a list.
   *
   * @param subscriptionListId The subscription list identifier.
   */
  unsubscribe(subscriptionListId: string) {
    const operation = {
      listId: subscriptionListId,
      action: SubscriptionListOperationAction.unsubscribe,
    };
    this.operations.push(operation);
    return this;
  }

  /**
   * Applies subscription list changes.
   *
   */
  apply(): Promise<void> {
    return this.onApply(this.operations);
  }
}

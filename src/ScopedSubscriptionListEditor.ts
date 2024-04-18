/* Copyright Airship and Contributors */

'use strict';

import { SubscriptionScope } from './types';

/**
 * Enum of internal scoped subscription list update type.
 * @hidden
 */
enum ScopedSubscriptionListOperationAction {
  subscribe = 'subscribe',
  unsubscribe = 'unsubscribe',
}

/**
 * Scoped subscription list operation.
 * @hidden
 */
export interface ScopedSubscriptionListOperation {
  /**
   * The subscription list identifier.
   */
  listId: string;
  /**
   * The subscription list update type.
   */
  action: ScopedSubscriptionListOperationAction;
  /**
   * The subscription scope to update.
   */
  scope: SubscriptionScope;
}

/**
 * Scoped subscription list editor.
 */
export class ScopedSubscriptionListEditor {
  onApply: (
    operations: ScopedSubscriptionListOperation[]
  ) => Promise<void>;
  operations: ScopedSubscriptionListOperation[];

  /**
   */
  constructor(
    onApply: (
      operations: ScopedSubscriptionListOperation[]
    ) => Promise<void>
  ) {
    this.onApply = onApply;
    this.operations = [];
  }

  /**
   * Subscribes to a list in the given scope.
   *
   * @param subscriptionListId The subscription list identifier.
   * @param scope The subscription scope to subscribe.
   * @return The editor instance.
   */
  subscribe(subscriptionListId: string, scope: SubscriptionScope): ScopedSubscriptionListEditor {
    const operation = {
      listId: subscriptionListId,
      action: ScopedSubscriptionListOperationAction.subscribe,
      scope: scope,
    };
    this.operations.push(operation);
    return this;
  }

  /**
   * Unsubscribe from a list.
   *
   * @param subscriptionListId The subscription list identifier.
   * @param scope The subscription scope to unsubscribe.
   * @return The editor instance.
   */
  unsubscribe(subscriptionListId: string, scope: SubscriptionScope): ScopedSubscriptionListEditor {
    const operation = {
      listId: subscriptionListId,
      action: ScopedSubscriptionListOperationAction.unsubscribe,
      scope: scope,
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

/* Copyright Airship and Contributors */

'use strict';

/**
 * Tag operation.
 * @hidden
 */
export interface TagOperation {
  /**
   * The operation name
   */
  operationType: string;
  /**
   * An array of tags.
   */
  tags: string[];
}

/**
 * Editor for device tags.
 */
export class TagEditor {
  onApply: (operations: TagOperation[]) => Promise<void>;
  operations: TagOperation[];

  /**
   * TagEditor constructor
   *
   * @hidden
   * @param onApply The apply function
   */
  constructor(onApply: (operations: TagOperation[]) => Promise<void>) {
    this.onApply = onApply;
    this.operations = [];
  }

  /**
   * Adds tags to a channel.
   *
   * @param tags Tags to add.
   * @return The tag editor instance.
   */
  addTags(tags: string[]): TagEditor {
    const operation = { operationType: 'add', tags: tags };
    this.operations.push(operation);
    return this;
  }

  /**
   * Removes tags from the channel.
   *
   * @param tags Tags to remove.
   * @return The tag editor instance.
   */
  removeTags(tags: string[]): TagEditor {
    const operation = { operationType: 'remove', tags: tags };
    this.operations.push(operation);
    return this;
  }

  /**
   * Applies the tag changes.
   */
  apply(): Promise<void> {
    return this.onApply(this.operations);
  }
}

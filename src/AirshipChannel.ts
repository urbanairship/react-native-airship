import { AttributeEditor, AttributeOperation } from './AttributeEditor';
import {
  SubscriptionListEditor, SubscriptionListOperation,
} from './SubscriptionListEditor';
import { TagGroupEditor, TagGroupOperation } from './TagGroupEditor';

/**
 * Airship channel.
 */
export class AirshipChannel {
  constructor(private readonly module: any) {}

  /**
   * Adds a device tag.
   * @param tag The tag.
   * @returns A promise.
   */
  public addTag(tag: string): Promise<void> {
    return this.module.channelAddTag(tag);
  }

  /**
   * Removes a device tag.
   * @param tag The tag.
   * @returns A promise.
   */
  public removeTag(tag: string): Promise<void> {
    return this.module.channelRemoveTag(tag);
  }

  /**
   * Gets the device tags.
   * @returns A promise with the result.
   */
  public getTags(): Promise<string[]> {
    return this.module.channelGetTags();
  }

  /**
   * Gets the channel Id.
   * 
   * @returns A promise with the result.
   */
  public getChannelId(): Promise<string | null | undefined> {
    return this.module.channelGetChannelId();
  }

  /**
   * Gets a list of the channel's subscriptions.
   * @returns A promise with the result.
   */
  public getSubscriptionLists(): Promise<string[]> {
    return this.module.channelGetSubscriptionLists();
  }

  /**
   * Edits tag groups.
   * @returns A tag group editor.
   */
  public editTagGroups(): TagGroupEditor {
    return new TagGroupEditor((operations: TagGroupOperation[]) => {
      return this.module.channelEditTagGroups(operations);
    });
  }

  /**
   * Edits attributes.
   * @returns An attribute editor.
   */
  public editAttributes(): AttributeEditor {
    return new AttributeEditor((operations: AttributeOperation[]) => {
      return this.module.channelEditAttributes(operations);
    });
  }

  /**
   * Edits subscription lists.
   * @returns A subscription list editor.
   */
  public editSubscriptionLists(): SubscriptionListEditor {
    return new SubscriptionListEditor(
      (operations: SubscriptionListOperation[]) => {
        return this.module.channelEditSubscriptionLists(operations);
      }
    );
  }
}

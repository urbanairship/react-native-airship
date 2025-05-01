import { AttributeEditor, AttributeOperation } from './AttributeEditor';
import {
  SubscriptionListEditor, SubscriptionListOperation,
} from './SubscriptionListEditor';
import { TagGroupEditor, TagGroupOperation } from './TagGroupEditor';
import { TagEditor, TagOperation } from './TagEditor';

/**
 * Airship channel.
 */
export class AirshipChannel {
  constructor(private readonly module: any) {}

  /**
   * Enables channel creation if channel creation has been delayed.
   * It is only necessary to call this when isChannelCreationDelayEnabled
   * has been set to `true` in the airship config.
   * Deprecated. Use the Private Manager to disable all features instead.
   */
  public enableChannelCreation(): Promise<void> {
    return this.module.channelEnableChannelCreation();
  }

  /**
   * Adds a device tag.
   * Deprecated. Use editTags() instead.
   * @param tag The tag.
   * @returns A promise.
   */
  public addTag(tag: string): Promise<void> {
    return this.module.channelAddTag(tag);
  }

  /**
   * Removes a device tag.
   * Deprecated. Use editTags() instead.
   * @param tag The tag.
   * @returns A promise.
   */
  public removeTag(tag: string): Promise<void> {
    return this.module.channelRemoveTag(tag);
  }

  /**
   * Edits device tags.
   * @returns A tag editor.
   */
  public editTags(): TagEditor {
    return new TagEditor((operations: TagOperation[]) => {
      return this.module.channelEditTags(operations);
    });
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
   * Returns the channel ID. If the channel ID is not yet created the function it will wait for it before returning. After
   * the channel ID is created, this method functions the same as `getChannelId()`.
   * 
   * @returns A promise with the result.
   */
    public waitForChannelId(): Promise<string | null | undefined> {
      return this.module.channelWaitForChannelId();
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

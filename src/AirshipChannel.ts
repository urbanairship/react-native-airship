import { AttributeEditor, AttributeOperation } from './AttributeEditor';
import {
  SubscriptionListEditor,
  SubscriptionListUpdate,
} from './SubscriptionListEditor';
import { TagGroupEditor, TagGroupOperation } from './TagGroupEditor';

export class AirshipChannel {
  constructor(private readonly module: any) {}

  public addTag(tag: string): Promise<void> {
    return this.module.channelAddTag(tag);
  }

  public removeTag(tag: string): Promise<void> {
    return this.module.channelRemoveTag(tag);
  }

  public getTags(): Promise<string[]> {
    return this.module.channelGetTags();
  }

  public getChannelId(): Promise<string | null | undefined> {
    return this.module.channelGetChannelId();
  }

  public getSubscriptionLists(): Promise<string[]> {
    return this.module.channelGetSubscriptionLists();
  }

  public editTagGroups(): TagGroupEditor {
    return new TagGroupEditor((operations: TagGroupOperation[]) => {
      return this.module.channelEditTagGroups(operations);
    });
  }

  public editAttributes(): AttributeEditor {
    return new AttributeEditor((operations: AttributeOperation[]) => {
      return this.module.channelEditAttributes(operations);
    });
  }

  public editSubscriptionLists(): SubscriptionListEditor {
    return new SubscriptionListEditor(
      (operations: SubscriptionListUpdate[]) => {
        return this.module.channelEditSubscriptionLists(operations);
      }
    );
  }
}

import { AttributeEditor, AttributeOperation } from './AttributeEditor';
import {
  ScopedSubscriptionListEditor,
  ScopedSubscriptionListOperation,
} from './ScopedSubscriptionListEditor';
import { TagGroupEditor, TagGroupOperation } from './TagGroupEditor';
import { SubscriptionScope } from './types';

export class AirshipContact {
  constructor(private readonly module: any) {}

  public identify(namedUser: string): Promise<void> {
    return this.module.contactIdentify(namedUser);
  }

  public reset(): Promise<void> {
    return this.module.contactReset();
  }

  public getNamedUserId(): Promise<string | null | undefined> {
    return this.module.contactGetNamedUserId();
  }

  public getSubscriptionLists(): Promise<Record<string, SubscriptionScope[]>> {
    return this.module.contactGetSubscriptionLists();
  }

  public editTagGroups(): TagGroupEditor {
    return new TagGroupEditor((operations: TagGroupOperation[]) => {
      return this.module.contactEditTagGroups(operations);
    });
  }

  public editAttributes(): AttributeEditor {
    return new AttributeEditor((operations: AttributeOperation[]) => {
      return this.module.contactEditAttributes(operations);
    });
  }

  public editSubscriptionLists(): ScopedSubscriptionListEditor {
    return new ScopedSubscriptionListEditor(
      (operations: ScopedSubscriptionListOperation[]) => {
        return this.module.contactEditSubscriptionLists(operations);
      }
    );
  }
}

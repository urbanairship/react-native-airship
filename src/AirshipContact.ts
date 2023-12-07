import { AttributeEditor, AttributeOperation } from './AttributeEditor';
import {
  ScopedSubscriptionListEditor,
  ScopedSubscriptionListOperation,
} from './ScopedSubscriptionListEditor';
import { TagGroupEditor, TagGroupOperation } from './TagGroupEditor';
import { SubscriptionScope } from './types';

/**
 * Airship contact.
 */
export class AirshipContact {
  constructor(private readonly module: any) {}

  /**
   * Identifies the contact with a named user Id.
   * @param namedUser The named user Id.
   * @returns A promise.
   */
  public identify(namedUser: string): Promise<void> {
    return this.module.contactIdentify(namedUser);
  }

  /**
   * Resets the contact.
   * @returns A promise.
   */
  public reset(): Promise<void> {
    return this.module.contactReset();
  }

  /**
   * Notifies the contact of a remote login.
   * @returns A promise.
   */
    public notifyRemoteLogin(): Promise<void> {
      return this.module.notifyRemoteLogin();
    }

  /**
   * Gets the named user Id.
   * @returns A promise with the result.
   */
  public getNamedUserId(): Promise<string | null | undefined> {
    return this.module.contactGetNamedUserId();
  }

  /**
   * Gets the contacts subscription lists.
   * @returns A promise with the result.
   */
  public getSubscriptionLists(): Promise<Record<string, SubscriptionScope[]>> {
    return this.module.contactGetSubscriptionLists();
  }

  /**
   * Edits tag groups.
   * @returns A tag group editor.
   */
  public editTagGroups(): TagGroupEditor {
    return new TagGroupEditor((operations: TagGroupOperation[]) => {
      return this.module.contactEditTagGroups(operations);
    });
  }

  /**
   * Edits attributes.
   * @returns An attribute editor.
   */
  public editAttributes(): AttributeEditor {
    return new AttributeEditor((operations: AttributeOperation[]) => {
      return this.module.contactEditAttributes(operations);
    });
  }

  /**
   * Edits subscription lists.
   * @returns A subscription list editor.
   */
  public editSubscriptionLists(): ScopedSubscriptionListEditor {
    return new ScopedSubscriptionListEditor(
      (operations: ScopedSubscriptionListOperation[]) => {
        return this.module.contactEditSubscriptionLists(operations);
      }
    );
  }
}

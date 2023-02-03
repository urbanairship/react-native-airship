import { InboxMessage } from './types';

/**
 * Airship Message Center
 */
export class AirshipMessageCenter {
  constructor(private readonly module: any) {}

  /**
   * Gets the unread count.
   * @returns A promise with the result.
   */
  public getUnreadCount(): Promise<number> {
    return this.module.messageCenterGetUnreadCount();
  }

  /**
   * Gets the inbox messages.
   * @returns A promise with the result.
   */
  public getMessages(): Promise<InboxMessage[]> {
    return this.module.messageCenterGetMessages();
  }

  /**
   * Marks a message as read.
   * @param messageId The message Id.
   * @returns A promise. Will reject if the message is not 
   * found or if takeOff is not called.
   */
  public markMessageRead(messageId: string): Promise<void> {
    return this.module.messageCenterMarkMessageRead(messageId);
  }

  /**
   * Deletes a message.
   * @param messageId The message Id.
   * @returns A promise. Will reject if the message is not 
   * found or if takeOff is not called.
   */
  public deleteMessage(messageId: string): Promise<void> {
    return this.module.messageCenterDeleteMessage(messageId);
  }

  /**
   * Dismisses the OOTB message center if displayed.
   * @returns A promise.
   */
  public dismiss(): Promise<void> {
    return this.module.messageCenterDismiss();
  }

  /**
   * Requests to display the Message Center.
   * 
   * Will either emit an event to display the 
   * Message Center if auto launch message center 
   * is disabled, or display the OOTB message center.
   * @param messageId Optional message Id.
   * @returns A promise.
   */
  public display(messageId?: string): Promise<void> {
    return this.module.messageCenterDisplay(messageId);
  }

  /**
   * Refreshes the messages.
   * @returns A promise. Will reject if the list fails to refresh or if 
   * takeOff is not called yet.
   */
  public refreshMessages(): Promise<void> {
    return this.module.messageCenterRefresh();
  }

  /**
   * Enables or disables showing the OOTB UI when requested to display by either
   * `display` or by a notification with a Message Center action.
   * @param autoLaunch true to show OOTB UI, false to emit events.
   */
  public setAutoLaunchDefaultMessageCenter(autoLaunch: boolean) {
    this.module.messageCenterSetAutoLaunchDefaultMessageCenter(autoLaunch);
  }
}

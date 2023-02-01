import { InboxMessage } from './types';

export class AirshipMessageCenter {
  constructor(private readonly module: any) {}

  public getUnreadCount(): Promise<number> {
    return this.module.messageCenterGetUnreadCount();
  }

  public getMessages(): Promise<InboxMessage[]> {
    return this.module.messageCenterGetMessages();
  }

  public markMessageRead(messageId: string): Promise<void> {
    return this.module.messageCenterMarkMessageRead(messageId);
  }

  public deleteMessage(messageId: string): Promise<void> {
    return this.module.messageCenterDeleteMessage(messageId);
  }

  public dismiss(): Promise<void> {
    return this.module.messageCenterDismiss();
  }

  public display(messageId?: string): Promise<void> {
    return this.module.messageCenterDisplay(messageId);
  }

  public refreshMessages(): Promise<void> {
    return this.module.messageCenterRefresh();
  }

  public setAutoLaunchDefaultMessageCenter(autoLaunch: boolean) {
    this.module.messageCenterSetAutoLaunchDefaultMessageCenter(autoLaunch);
  }
}

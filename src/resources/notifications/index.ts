// Strategy Pattern

export interface SendNotificationStrategy {
  send(): Promise<void>;
}

export class SendWhatsAppNotification implements SendNotificationStrategy {
  async send(): Promise<void> {
    return Promise.resolve();
  }
}

export class SendEmailNotification implements SendNotificationStrategy {
  async send(): Promise<void> {
    return Promise.resolve();
  }
}

export class SendSMSNotification implements SendNotificationStrategy {
  async send(): Promise<void> {
    return Promise.resolve();
  }
}

export class SendPushNotification implements SendNotificationStrategy {
  async send(): Promise<void> {
    return Promise.resolve();
  }
}

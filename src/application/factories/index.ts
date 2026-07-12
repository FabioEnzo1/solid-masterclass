import {
  SendEmailNotification,
  SendNotificationStrategy,
  SendPushNotification,
  SendSMSNotification,
  SendWhatsAppNotification,
} from "../../resources/notifications";

export class SendNotificationFactory {
  static create(channel: string): SendNotificationStrategy {
    switch (channel) {
      case "email":
        return new SendEmailNotification();
      case "sms":
        return new SendSMSNotification();
      case "push":
        return new SendPushNotification();
      case "whatsapp":
        return new SendWhatsAppNotification();
      default:
        throw new Error("Invalid Channel");
    }
  }
}

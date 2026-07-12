export interface User {
  id: string;
  name: string;
  age: number;
  phoneNumber: string;
  email: string;
  password: string;
  preferredMarketingChannel: "email" | "sms" | "push" | "whatsapp";
}

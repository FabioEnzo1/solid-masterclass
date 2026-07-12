import bcrypt from "bcrypt";

import { UserRepository } from "../../resources/repositories/UserRepository";
import {
  EmailAlreadyRegisteredError,
  InvalidMarketingChannelError,
  PasswordsDoNotMatchError,
  UserCreationError,
} from "../errors";

type MarketingChannel = "email" | "sms" | "push" | "whatsapp";

const marketingChannels: MarketingChannel[] = [
  "email",
  "sms",
  "push",
  "whatsapp",
];

interface InputDTO {
  name: string;
  age: number;
  phoneNumber: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  preferredMarketingChannel: MarketingChannel;
}

interface OutputDTO {
  id: string;
  name: string;
  age: number;
  phoneNumber: string;
  email: string;
  preferredMarketingChannel: MarketingChannel;
}

export class CreateUser {
  constructor(private userRepository: UserRepository) {}

  async execute(input: InputDTO): Promise<OutputDTO> {
    if (input.password !== input.passwordConfirmation) {
      throw new PasswordsDoNotMatchError();
    }
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new EmailAlreadyRegisteredError();
    }
    if (!marketingChannels.includes(input.preferredMarketingChannel)) {
      throw new InvalidMarketingChannelError();
    }

    const user = await this.userRepository.create({
      id: crypto.randomUUID(),
      name: input.name,
      age: input.age,
      phoneNumber: input.phoneNumber,
      email: input.email,
      password: await bcrypt.hash(input.password, 10),
      preferredMarketingChannel: input.preferredMarketingChannel,
    });
    if (!user) {
      throw new UserCreationError();
    }
    return {
      id: user.id,
      name: user.name,
      age: user.age,
      phoneNumber: user.phoneNumber,
      email: user.email,
      preferredMarketingChannel: user.preferredMarketingChannel,
    };
  }
}

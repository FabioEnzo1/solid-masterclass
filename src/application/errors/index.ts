export class PasswordsDoNotMatchError extends Error {
  constructor() {
    super("Passwords do not match");
  }
}

export class EmailAlreadyRegisteredError extends Error {
  constructor() {
    super("Email já cadastrado!");
  }
}

export class InvalidMarketingChannelError extends Error {
  constructor() {
    super("Canal de marketing inválido!");
  }
}

export class UserCreationError extends Error {
  constructor() {
    super("Erro ao criar o usuário!");
  }
}

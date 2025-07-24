export class UserResponseDTO {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly username: string,
    public readonly is_verified: boolean,
    public readonly status: string,
  ) {}
}

export class AuthResponseDTO {
  constructor(
    public readonly accessToken: string,
    public readonly refreshToken: string,
    public readonly user: UserResponseDTO,
  ) {}
}

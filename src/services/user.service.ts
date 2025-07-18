import { User } from '@auth/db/models/user.model';

export class UserService {
  constructor() {

  }

  public async findByEmail(email: string): Promise<User | null> {
    return User.findOne({ where: { email } });
  }
}

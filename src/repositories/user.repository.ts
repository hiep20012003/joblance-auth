import { User } from '@auth/db/models/user.model';

export class UserRepository {
  constructor() {}

  findById = async (id: string): Promise<User | null> => {
    return await User.findOne({ where: { id } });
  };

  findByEmail = async (email: string): Promise<User | null> => {
    return await User.findOne({ where: { email } });
  };

  save = async (user: User): Promise<User> => {
    return await user.save();
  };

  updateEmailVerified = async (id: string, is_verified: boolean): Promise<void> => {
    await User.update(
      { is_verified },
      { where: { id } }
    );
  };
}

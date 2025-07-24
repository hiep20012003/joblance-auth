// import { User } from '@auth/db/models/user.model';

import { User } from '@auth/db/models/user.model';
import { UserRepository } from '@auth/repositories/user.repository';

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}
  findOneById = async (id: string): Promise<User | null> => {
    return await this.userRepository.findById(id);
  };

  findOneByEmail = async (email: string): Promise<User | null> => {
    return await this.userRepository.findByEmail(email);
  };

  updateEmailVerified = async (id: string, is_verified: boolean): Promise<void> => {
    await User.update(
      { is_verified },
      { where: { id } }
    );
  };
}

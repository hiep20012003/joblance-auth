import {User} from '@auth/database/models/user.model';
import {Role} from '@auth/database/models/role.model';
import {SignUpDTO} from '@auth/schemas/auth/sign-up.schema';

export class UserRepository {
  constructor() {
  }

  findById = async (id: string): Promise<User | null> => {
    return await User.findOne({where: {id}, include: [{model: Role, as: 'roles'}]});
  };

  findByUsername = async (username: string): Promise<User | null> => {
    return await User.findOne({where: {username}});
  };

  findByEmail = async (email: string): Promise<User | null> => {
    return await User.findOne({where: {email}, include: [{model: Role, as: 'roles'}]});
  };

  create = async (user: SignUpDTO): Promise<User> => {
    return await User.create(user);
  };

  save = async (user: User): Promise<User> => {
    return await user.save();
  };

  updateEmailVerified = async (id: string, isVerified: boolean): Promise<void> => {
    await User.update({isVerified}, {where: {id}});
  };

  updateProfilePicture = async (id: string, profilePicture: string): Promise<void> => {
    await User.update({profilePicture}, {where: {id}});
  };

  findAll = async (): Promise<User[]> => {
    return await User.findAll();
  };

  delete = async (id: string): Promise<void> => {
    await User.destroy({where: {id}});
  };

  addRole = async (user: User, role: Role): Promise<void> => {
    await user.addRole(role);
  };
}

export const userRepository: UserRepository = new UserRepository();

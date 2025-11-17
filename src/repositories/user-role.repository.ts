import { Role } from '@auth/database/models/role.model';
import { UsersRoles } from '@auth/database/models/users-roles.model';
import { User } from '@auth/database/models/user.model';

export class UserRoleRepository {
  public async findById(id: string): Promise<UsersRoles | null> {
    return await UsersRoles.findOne({ where: { id } });
  }

  public async findByUserIdAndRoleId(userId: string, roleId: string): Promise<UsersRoles | null> {
    return await UsersRoles.findOne({ where: { userId: userId, roleId: roleId } });
  }

  public async findByUserId(userId: string): Promise<UsersRoles[]> {
    return await UsersRoles.findAll({
      where: { userId: userId },
      include: [
        { model: Role, as: 'role' },
        { model: User, as: 'user' }
      ]
    });
  }

  public async findByRoleId(roleId: string): Promise<UsersRoles[]> {
    return await UsersRoles.findAll({ where: { roleId: roleId } });
  }

  public async save(userRole: UsersRoles): Promise<UsersRoles> {
    return await userRole.save();
  }

  public async delete(id: string): Promise<void> {
    await UsersRoles.destroy({ where: { id } });
  }

  public async deleteByUserIdAndRoleId(userId: string, roleId: string): Promise<void> {
    await UsersRoles.destroy({ where: { userId: userId, roleId: roleId } });
  }
}
export const userRoleRepository: UserRoleRepository = new UserRoleRepository();

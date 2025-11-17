import { roleRepository } from '@auth/repositories/role.repository';
import { userRoleRepository } from '@auth/repositories/user-role.repository';
import { userRepository } from '@auth/repositories/user.repository';
import { Role } from '@auth/database/models/role.model';
import { UsersRoles } from '@auth/database/models/users-roles.model';
import { ConflictError, ErrorCode, NotFoundError } from '@hiep20012003/joblance-shared';
import { AppLogger } from '@auth/utils/logger';

export class RoleService {
  public async createRole(name: string, description: string): Promise<Role> {
    const operation = 'role:create';
    const existingRole = await roleRepository.findByName(name);
    if (existingRole) {
      throw new ConflictError({
        clientMessage: `Role with name '${name}' already exists.`,
        operation,
        errorCode: ErrorCode.RESOURCE_CONFLICT,
        context: { name }
      });
    }
    const newRole = new Role({ name, description });
    const role = await roleRepository.save(newRole);
    AppLogger.info(`Role '${name}' created successfully.`, {
      operation,
      metadata: { roleId: newRole.id, roleName: name }
    });
    return role;
  }

  public async getAllRoles(): Promise<Role[]> {
    return await roleRepository.findAll();
  }

  public async getRoleById(id: string): Promise<Role> {
    const operation = 'role:get-by-id';
    const role = await roleRepository.findById(id);
    if (!role) {
      throw new NotFoundError({
        clientMessage: `Role with ID '${id}' not found.`,
        operation,
        errorCode: ErrorCode.NOT_FOUND,
        context: { id }
      });
    }
    return role;
  }

  public async getRoleByName(name: string): Promise<Role> {
    const operation = 'role:get-by-id';
    const role = await roleRepository.findByName(name);
    if (!role) {
      throw new NotFoundError({
        clientMessage: `Role with Name '${name}' not found.`,
        operation,
        errorCode: ErrorCode.NOT_FOUND,
        context: { name }
      });
    }
    return role;
  }

  public async updateRole(id: string, newName: string, description?: string): Promise<Role> {
    const operation = 'role:update';
    const role = await roleRepository.findById(id);
    if (!role) {
      throw new NotFoundError({
        clientMessage: `Role with ID '${id}' not found.`,
        operation,
        errorCode: ErrorCode.NOT_FOUND,
        context: { id }
      });
    }
    const existingRoleWithName = await roleRepository.findByName(newName);
    if (existingRoleWithName && existingRoleWithName.id !== id) {
      throw new ConflictError({
        clientMessage: `Role with name '${newName}' already exists.`,
        operation,
        errorCode: ErrorCode.RESOURCE_CONFLICT,
        context: { newName }
      });
    }
    if (newName) role.name = newName;
    if (description) role.description = description;
    AppLogger.info(`Role with ID '${id}' updated to name '${newName}'.`, {
      operation,
      metadata: { roleId: id, newRoleName: newName, description }
    });
    return await roleRepository.save(role);
  }

  public async deleteRole(id: string): Promise<void> {
    const operation = 'role:delete';
    const role = await roleRepository.findById(id);
    if (!role) {
      throw new NotFoundError({
        clientMessage: `Role with ID '${id}' not found.`,
        operation,
        errorCode: ErrorCode.NOT_FOUND,
        context: { id }
      });
    }
    await roleRepository.delete(id);
    AppLogger.info(`Role with ID '${id}' deleted successfully.`, { operation, metadata: { roleId: id } });
  }

  public async assignRoleToUser(userId: string, roleId: string): Promise<UsersRoles> {
    const operation = 'role:assign-to-user';
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError({
        clientMessage: `User with ID '${userId}' not found.`,
        operation,
        errorCode: ErrorCode.NOT_FOUND,
        context: { userId }
      });
    }
    const role = await roleRepository.findById(roleId);
    if (!role) {
      throw new NotFoundError({
        clientMessage: `Role with ID '${roleId}' not found.`,
        operation,
        errorCode: ErrorCode.NOT_FOUND,
        context: { roleId }
      });
    }
    const existingUserRole = await userRoleRepository.findByUserIdAndRoleId(userId, roleId);
    if (existingUserRole) {
      throw new ConflictError({
        clientMessage: `User '${user.username}' already has role '${role.name}'.`,
        operation,
        errorCode: ErrorCode.RESOURCE_CONFLICT,
        context: { userId, roleId }
      });
    }
    const newUserRole = new UsersRoles({ userId: userId, roleId: roleId });
    AppLogger.info(`Role '${role.name}' assigned to user '${user.username}'.`, {
      operation,
      metadata: { userId, roleId }
    });
    return await userRoleRepository.save(newUserRole);
  }

  public async unassignRoleFromUser(userId: string, roleId: string): Promise<void> {
    const operation = 'role:unassign-from-user';
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError({
        clientMessage: `User with ID '${userId}' not found.`,
        operation,
        errorCode: ErrorCode.NOT_FOUND,
        context: { userId }
      });
    }
    const role = await roleRepository.findById(roleId);
    if (!role) {
      throw new NotFoundError({
        clientMessage: `Role with ID '${roleId}' not found.`,
        operation,
        errorCode: ErrorCode.NOT_FOUND,
        context: { roleId }
      });
    }
    const existingUserRole = await userRoleRepository.findByUserIdAndRoleId(userId, roleId);
    if (!existingUserRole) {
      throw new NotFoundError({
        clientMessage: `User '${user.username}' does not have role '${role.name}'.`,
        operation,
        errorCode: ErrorCode.NOT_FOUND,
        context: { userId, roleId }
      });
    }
    await userRoleRepository.deleteByUserIdAndRoleId(userId, roleId);
    AppLogger.info(`Role '${role.name}' unassigned from user '${user.username}'.`, {
      operation,
      metadata: { userId, roleId }
    });
  }

  public async getUserRole(userId: string): Promise<UsersRoles[]> {
    const operation = 'role:get-user-roles';
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError({
        clientMessage: `User with ID '${userId}' not found.`,
        operation,
        errorCode: ErrorCode.NOT_FOUND,
        context: { userId }
      });
    }
    AppLogger.info(`Retrieving roles for user '${user.username}'.`, { operation, metadata: { userId } });
    return await userRoleRepository.findByUserId(userId);
  }
}

export const roleService: RoleService = new RoleService();

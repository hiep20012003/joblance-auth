import { Role } from '@auth/database/models/role.model';

export class RoleRepository {
  constructor() {}

  public async findById(id: string): Promise<Role | null> {
    return await Role.findOne({ where: { id } });
  }

  public async findByName(name: string): Promise<Role | null> {
    return await Role.findOne({ where: { name } });
  }

  public async findAll(): Promise<Role[]> {
    return await Role.findAll();
  }

  public async save(role: Role): Promise<Role> {
    return await role.save();
  }

  public async delete(id: string): Promise<void> {
    await Role.destroy({ where: { id } });
  }
}

export const roleRepository: RoleRepository = new RoleRepository();

import { Sequelize } from 'sequelize';
import type { MigrationFn } from 'umzug';
import { v4 as uuidv4 } from 'uuid';
import { hash } from 'bcrypt';

export const up: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();

  try {
    await sequelize.transaction(async (transaction) => {
      // Insert roles
      const rolesToInsert = [
        {
          id: uuidv4(),
          name: 'admin',
          description: 'Administrator role',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: uuidv4(),
          name: 'seller',
          description: 'Seller role',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: uuidv4(),
          name: 'buyer',
          description: 'Buyer role',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      await queryInterface.bulkInsert('roles', rolesToInsert, { transaction });

      // Create an admin user
      const hashedPassword = await hash('admin', 10);
      const adminUserId = uuidv4();
      await queryInterface.bulkInsert('users', [
        {
          id: adminUserId,
          username: 'admin',
          email: 'admin@joblance.com',
          password: hashedPassword,
          isVerified: true,
          status: 'ACTIVE',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ], { transaction });

      // Link admin user to admin role
      const adminRole = await queryInterface.rawSelect(
        'roles',
        { where: { name: 'admin' }, transaction },
        ['id']
      );

      if (adminRole) {
        await queryInterface.bulkInsert('users_roles', [
          {
            id: uuidv4(),
            userId: adminUserId,
            roleId: adminRole,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ], { transaction });
      }
    });
  } catch (error) {
    console.error('Migration UP failed:', error);
    throw error; // bắt buộc rethrow để Umzug rollback
  }
};

export const down: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();

  try {
    await sequelize.transaction(async (transaction) => {
      // Delete admin user from users_roles
      const adminUserId = await queryInterface.rawSelect(
        'users',
        { where: { email: 'admin@joblance.com' }, transaction },
        ['id']
      );

      if (adminUserId) {
        await queryInterface.bulkDelete('users_roles', { userId: adminUserId }, { transaction });
      }

      // Delete admin user
      await queryInterface.bulkDelete('users', { email: 'admin@joblance.com' }, { transaction });

      // Delete roles
      await queryInterface.bulkDelete('roles', {
        name: ['admin', 'seller', 'buyer'],
      }, { transaction });
    });
  } catch (error) {
    console.error('Migration DOWN failed:', error);
    throw error;
  }
};

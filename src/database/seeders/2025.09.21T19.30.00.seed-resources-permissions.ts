import { Sequelize, Op } from 'sequelize';
import type { MigrationFn } from 'umzug';
import { v4 as uuidv4 } from 'uuid';

export const up: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();

  try {
    await sequelize.transaction(async (transaction) => {
      // 1. Insert Resources
      const resourcesToInsert = [
        { id: uuidv4(), name: 'User', createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), name: 'Gig', createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), name: 'Order', createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), name: 'Review', createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), name: 'Chat', createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), name: 'Notification', createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), name: 'Role', createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), name: 'Permission', createdAt: new Date(), updatedAt: new Date() },
      ];
      await queryInterface.bulkInsert('resources', resourcesToInsert, { transaction });

      // Store resource IDs for later use
      const resourceIds: { [key: string]: string } = {};
      for (const res of resourcesToInsert) {
        resourceIds[res.name] = res.id;
      }

      // 2. Get Role IDs
      const adminRole = await queryInterface.rawSelect('roles', { where: { name: 'admin' }, transaction }, ['id']);
      const sellerRole = await queryInterface.rawSelect('roles', { where: { name: 'seller' }, transaction }, ['id']);
      const buyerRole = await queryInterface.rawSelect('roles', { where: { name: 'buyer' }, transaction }, ['id']);

      const permissionsToInsert = [];

      // Admin Permissions
      if (adminRole) {
        // User
        permissionsToInsert.push(
          { id: uuidv4(), roleId: adminRole, resourceId: resourceIds.User, action: 'create:any', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
          { id: uuidv4(), roleId: adminRole, resourceId: resourceIds.User, action: 'read:any', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
          { id: uuidv4(), roleId: adminRole, resourceId: resourceIds.User, action: 'update:any', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
          { id: uuidv4(), roleId: adminRole, resourceId: resourceIds.User, action: 'delete:any', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
        );
        // Gig
        permissionsToInsert.push(
          { id: uuidv4(), roleId: adminRole, resourceId: resourceIds.Gig, action: 'create:any', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
          { id: uuidv4(), roleId: adminRole, resourceId: resourceIds.Gig, action: 'read:any', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
          { id: uuidv4(), roleId: adminRole, resourceId: resourceIds.Gig, action: 'update:any', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
          { id: uuidv4(), roleId: adminRole, resourceId: resourceIds.Gig, action: 'delete:any', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
        );
        // Order
        permissionsToInsert.push(
          { id: uuidv4(), roleId: adminRole, resourceId: resourceIds.Order, action: 'read:any', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
          { id: uuidv4(), roleId: adminRole, resourceId: resourceIds.Order, action: 'update:any', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
        );
        // Review
        permissionsToInsert.push(
          { id: uuidv4(), roleId: adminRole, resourceId: resourceIds.Review, action: 'read:any', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
          { id: uuidv4(), roleId: adminRole, resourceId: resourceIds.Review, action: 'delete:any', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
        );
        // Chat
        permissionsToInsert.push(
          { id: uuidv4(), roleId: adminRole, resourceId: resourceIds.Chat, action: 'read:any', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
        );
        // Notification
        permissionsToInsert.push(
          { id: uuidv4(), roleId: adminRole, resourceId: resourceIds.Notification, action: 'create:any', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
          { id: uuidv4(), roleId: adminRole, resourceId: resourceIds.Notification, action: 'read:any', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
          { id: uuidv4(), roleId: adminRole, resourceId: resourceIds.Notification, action: 'update:any', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
          { id: uuidv4(), roleId: adminRole, resourceId: resourceIds.Notification, action: 'delete:any', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
        );
        // Role
        permissionsToInsert.push(
          { id: uuidv4(), roleId: adminRole, resourceId: resourceIds.Role, action: 'create:any', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
          { id: uuidv4(), roleId: adminRole, resourceId: resourceIds.Role, action: 'read:any', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
          { id: uuidv4(), roleId: adminRole, resourceId: resourceIds.Role, action: 'update:any', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
          { id: uuidv4(), roleId: adminRole, resourceId: resourceIds.Role, action: 'delete:any', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
        );
        // Permission
        permissionsToInsert.push(
          { id: uuidv4(), roleId: adminRole, resourceId: resourceIds.Permission, action: 'create:any', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
          { id: uuidv4(), roleId: adminRole, resourceId: resourceIds.Permission, action: 'read:any', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
          { id: uuidv4(), roleId: adminRole, resourceId: resourceIds.Permission, action: 'update:any', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
          { id: uuidv4(), roleId: adminRole, resourceId: resourceIds.Permission, action: 'delete:any', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
        );
      }

      // Seller Permissions
      if (sellerRole) {
        // User
        permissionsToInsert.push(
          { id: uuidv4(), roleId: sellerRole, resourceId: resourceIds.User, action: 'read:own', attributes: '*, !password', createdAt: new Date(), updatedAt: new Date() },
          { id: uuidv4(), roleId: sellerRole, resourceId: resourceIds.User, action: 'update:own', attributes: '*, !password', createdAt: new Date(), updatedAt: new Date() },
        );
        // Gig
        permissionsToInsert.push(
          { id: uuidv4(), roleId: sellerRole, resourceId: resourceIds.Gig, action: 'create:own', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
          { id: uuidv4(), roleId: sellerRole, resourceId: resourceIds.Gig, action: 'read:own', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
          { id: uuidv4(), roleId: sellerRole, resourceId: resourceIds.Gig, action: 'update:own', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
          { id: uuidv4(), roleId: sellerRole, resourceId: resourceIds.Gig, action: 'delete:own', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
          { id: uuidv4(), roleId: sellerRole, resourceId: resourceIds.Gig, action: 'read:any', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
        );
        // Order
        permissionsToInsert.push(
          { id: uuidv4(), roleId: sellerRole, resourceId: resourceIds.Order, action: 'read:own', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
          { id: uuidv4(), roleId: sellerRole, resourceId: resourceIds.Order, action: 'update:own', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
        );
        // Review
        permissionsToInsert.push(
          { id: uuidv4(), roleId: sellerRole, resourceId: resourceIds.Review, action: 'read:own', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
          { id: uuidv4(), roleId: sellerRole, resourceId: resourceIds.Review, action: 'read:any', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
        );
        // Chat
        permissionsToInsert.push(
          { id: uuidv4(), roleId: sellerRole, resourceId: resourceIds.Chat, action: 'create:any', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
          { id: uuidv4(), roleId: sellerRole, resourceId: resourceIds.Chat, action: 'read:own', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
          { id: uuidv4(), roleId: sellerRole, resourceId: resourceIds.Chat, action: 'update:own', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
        );
        // Notification
        permissionsToInsert.push(
          { id: uuidv4(), roleId: sellerRole, resourceId: resourceIds.Notification, action: 'read:own', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
          { id: uuidv4(), roleId: sellerRole, resourceId: resourceIds.Notification, action: 'delete:own', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
        );
      }

      // Buyer Permissions
      if (buyerRole) {
        // User
        permissionsToInsert.push(
          { id: uuidv4(), roleId: buyerRole, resourceId: resourceIds.User, action: 'read:own', attributes: '*, !password', createdAt: new Date(), updatedAt: new Date() },
          { id: uuidv4(), roleId: buyerRole, resourceId: resourceIds.User, action: 'update:own', attributes: '*, !password', createdAt: new Date(), updatedAt: new Date() },
        );
        // Gig
        permissionsToInsert.push(
          { id: uuidv4(), roleId: buyerRole, resourceId: resourceIds.Gig, action: 'read:any', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
        );
        // Order
        permissionsToInsert.push(
          { id: uuidv4(), roleId: buyerRole, resourceId: resourceIds.Order, action: 'create:own', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
          { id: uuidv4(), roleId: buyerRole, resourceId: resourceIds.Order, action: 'read:own', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
          { id: uuidv4(), roleId: buyerRole, resourceId: resourceIds.Order, action: 'update:own', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
          { id: uuidv4(), roleId: buyerRole, resourceId: resourceIds.Order, action: 'delete:own', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
        );
        // Review
        permissionsToInsert.push(
          { id: uuidv4(), roleId: buyerRole, resourceId: resourceIds.Review, action: 'create:own', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
          { id: uuidv4(), roleId: buyerRole, resourceId: resourceIds.Review, action: 'read:own', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
          { id: uuidv4(), roleId: buyerRole, resourceId: resourceIds.Review, action: 'update:own', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
          { id: uuidv4(), roleId: buyerRole, resourceId: resourceIds.Review, action: 'delete:own', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
          { id: uuidv4(), roleId: buyerRole, resourceId: resourceIds.Review, action: 'read:any', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
        );
        // Chat
        permissionsToInsert.push(
          { id: uuidv4(), roleId: buyerRole, resourceId: resourceIds.Chat, action: 'create:any', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
          { id: uuidv4(), roleId: buyerRole, resourceId: resourceIds.Chat, action: 'read:own', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
          { id: uuidv4(), roleId: buyerRole, resourceId: resourceIds.Chat, action: 'update:own', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
        );
        // Notification
        permissionsToInsert.push(
          { id: uuidv4(), roleId: buyerRole, resourceId: resourceIds.Notification, action: 'read:own', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
          { id: uuidv4(), roleId: buyerRole, resourceId: resourceIds.Notification, action: 'delete:own', attributes: '*', createdAt: new Date(), updatedAt: new Date() },
        );
      }

      await queryInterface.bulkInsert('permissions', permissionsToInsert, { transaction });
    });
  } catch (error) {
    console.error('Migration UP failed:', error);
    throw error;
  }
};

export const down: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();

  try {
    await sequelize.transaction(async (transaction) => {
      // Get Resource IDs to delete permissions
      const resourcesToDelete = [
        'User', 'Gig', 'Order', 'Review', 'Chat', 'Notification', 'Role', 'Permission'
      ];
      const resourceIdsToDelete: string[] = [];
      for (const resName of resourcesToDelete) {
        const resource = await queryInterface.rawSelect('resources', { where: { name: resName }, transaction }, ['id']);
        if (resource) {
          resourceIdsToDelete.push(...resource);
        }
      }

      // Delete Permissions
      if (resourceIdsToDelete.length > 0) {
        await queryInterface.bulkDelete('permissions', { resourceId: { [Op.in]: resourceIdsToDelete } }, { transaction });
      }

      // Delete Resources
      await queryInterface.bulkDelete('resources', {
        name: resourcesToDelete,
      }, { transaction });
    });
  } catch (error) {
    console.error('Migration DOWN failed:', error);
    throw error;
  }
};

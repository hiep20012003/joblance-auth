import { DataTypes, Sequelize } from 'sequelize';

import type { MigrationFn } from 'umzug';

export const up: MigrationFn<Sequelize> = async ({ context }) => {
  await context.getQueryInterface().createTable('permissions', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    roleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    resourceId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'resources',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    attributes: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  await context.getQueryInterface().addConstraint('permissions', {
    fields: ['roleId', 'resourceId', 'action'],
    type: 'unique',
    name: 'unique_role_resource_action_constraint',
  });
};

export const down: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.dropTable('permissions');
};

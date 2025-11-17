import { DataTypes, Sequelize } from 'sequelize';

import type { MigrationFn } from 'umzug';

export const up: MigrationFn<Sequelize> = async ({ context }) => {
  await context.getQueryInterface().createTable('password_reset_tokens', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID, // Changed from INTEGER to UUID
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expireAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    used: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
};

export const down: MigrationFn<Sequelize> = async ({ context }) => {
  await context.getQueryInterface().dropTable('password_reset_tokens');
};

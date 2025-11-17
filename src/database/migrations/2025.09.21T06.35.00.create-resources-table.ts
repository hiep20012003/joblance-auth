import { DataTypes, Sequelize } from 'sequelize';

import type { MigrationFn } from 'umzug';

export const up: MigrationFn<Sequelize> = async ({ context }) => {
  await context.getQueryInterface().createTable('resources', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  });
};

export const down: MigrationFn<Sequelize> = async ({ context }) => {
  await context.getQueryInterface().dropTable('resources');
};

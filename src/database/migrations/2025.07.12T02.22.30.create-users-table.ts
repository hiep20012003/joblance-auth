import {DataTypes, Sequelize} from 'sequelize';

import type {MigrationFn} from 'umzug';

export const up: MigrationFn<Sequelize> = async ({context}) => {
  await context.getQueryInterface().createTable('users', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    profilePicture: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '',
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'BANNED'),
      allowNull: false,
      defaultValue: 'ACTIVE',
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

export const down: MigrationFn<Sequelize> = async ({context}) => {
  await context.getQueryInterface().dropTable('users');
};

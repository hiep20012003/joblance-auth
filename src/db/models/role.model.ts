import { Model, DataTypes, Sequelize } from 'sequelize';

import { User } from './user.model';

export class Role extends Model {
  declare id: number;
  declare name: string;
  declare description?: string;

  declare readonly users?: User[];

  static initialize(sequelize: Sequelize) {
    Role.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: DataTypes.STRING,
          unique: true,
        },
        description: {
          type: DataTypes.TEXT,
        },
      },
      {
        sequelize,
        tableName: 'roles',
        timestamps: false,
      }
    );
  }
}

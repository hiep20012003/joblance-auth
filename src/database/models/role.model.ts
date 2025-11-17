import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes } from 'sequelize';

import { User } from './user.model';

export class Role extends Model<
  InferAttributes<Role>,
  InferCreationAttributes<Role>
> {
  declare id?: string;
  declare name: string;
  declare description?: string;

  declare readonly users?: User[];
  declare readonly permissions?: Permissions[];

  static initialize(sequelize: Sequelize) {
    Role.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
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
        timestamps: true,
      }
    );
  }
}

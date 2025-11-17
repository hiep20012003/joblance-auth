import {
  DataTypes,
  Model,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

import { Resource } from './resource.model';
import { Role } from './role.model';

export class Permission extends Model<
  InferAttributes<Permission>,
  InferCreationAttributes<Permission>
> {
  declare id: CreationOptional<string>;
  declare roleId: string;
  declare resourceId: string;
  declare action: string;
  declare attributes: string;

  declare role?: Role;
  declare resource?: Resource;

  static initialize(sequelize: Sequelize) {
    Permission.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        roleId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        resourceId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        action: {
          type: DataTypes.STRING,
          allowNull: false, // ex: "create:any"
        },
        attributes: {
          type: DataTypes.STRING, // ex: "* , !views"
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'permissions',
        timestamps: true,
        indexes: [
          {
            unique: true,
            fields: ['roleId', 'resourceId', 'action'],
          },
        ],
      }
    );
  }
}

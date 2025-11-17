import { Model, DataTypes, Sequelize, CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';

import { User } from './user.model';

export class RefreshToken extends Model<
  InferAttributes<RefreshToken>,
  InferCreationAttributes<RefreshToken>
> {
  declare id: CreationOptional<string>;
  declare userId: string;
  declare token: string;
  declare deviceType?: string;
  declare browserName?: string;
  declare ipAddress?: string;
  declare expireAt: Date;
  declare revoked?: boolean;

  declare readonly user?: User;

  static initialize(sequelize: Sequelize) {
    RefreshToken.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        token: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        deviceType: {
          type: DataTypes.STRING,
        },
        browserName: {
          type: DataTypes.STRING,
        },
        ipAddress: {
          type: DataTypes.STRING,
        },
        expireAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        revoked: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
      },
      {
        sequelize,
        tableName: 'refresh_tokens',
        timestamps: true,
      }
    );
  }
}

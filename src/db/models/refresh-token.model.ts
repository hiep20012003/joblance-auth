import { Model, DataTypes, Sequelize, CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';

import { User } from './user.model';

export class RefreshToken extends Model<InferAttributes<RefreshToken>, InferCreationAttributes<RefreshToken>> {
  declare id: CreationOptional<string>;
  declare user_id: string;
  declare token: string;
  declare user_agent?: string;
  declare ip_address?: string;
  declare expires_at: Date;
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
        user_id: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        token: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        user_agent: {
          type: DataTypes.STRING,
        },
        ip_address: {
          type: DataTypes.STRING,
        },
        expires_at: {
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

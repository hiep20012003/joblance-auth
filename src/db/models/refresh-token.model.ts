import { Model, DataTypes, Sequelize } from 'sequelize';

import { User } from './user.model';

export class RefreshToken extends Model {
  declare id: number;
  declare user_id: number;
  declare token: string;
  declare user_agent?: string;
  declare ip_address?: string;
  declare expires_at: Date;
  declare revoked: boolean;

  declare readonly user?: User;

  static initialize(sequelize: Sequelize) {
    RefreshToken.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        user_id: {
          type: DataTypes.INTEGER,
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

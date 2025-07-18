import { Model, DataTypes, Sequelize } from 'sequelize';

import { User } from './user.model';

export class PasswordResetToken extends Model {
  declare id: number;
  declare user_id: number;
  declare token: string;
  declare expires_at: Date;
  declare used: boolean;

  declare readonly user?: User;

  static initialize(sequelize: Sequelize) {
    PasswordResetToken.init(
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
          type: DataTypes.STRING,
          allowNull: false,
        },
        expires_at: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        used: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
      },
      {
        sequelize,
        tableName: 'password_reset_tokens',
        timestamps: true,
      }
    );
  }
}

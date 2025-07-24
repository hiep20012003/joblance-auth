import { Model, DataTypes, Sequelize } from 'sequelize';

import { User } from './user.model';

export class EmailVerificationToken extends Model {
  declare id: string;
  declare user_id: string;
  declare token: string;
  declare expires_at: Date;
  declare used: boolean;

  declare readonly user?: User;

  static initialize(sequelize: Sequelize) {
    EmailVerificationToken.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4
        },
        user_id: {
          type: DataTypes.STRING,
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
        tableName: 'email_verification_tokens',
        timestamps: true,
      }
    );
  }
}

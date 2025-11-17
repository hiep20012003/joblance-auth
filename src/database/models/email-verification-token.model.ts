import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes } from 'sequelize';

import { User } from './user.model';

export class EmailVerificationToken extends Model<
  InferAttributes<EmailVerificationToken>,
  InferCreationAttributes<EmailVerificationToken>
> {
  declare id: string;
  declare userId: string;
  declare token: string;
  declare expireAt: Date;
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
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        token: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        expireAt: {
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

import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

import { User } from './user.model';

export class PasswordResetToken extends Model<
  InferAttributes<PasswordResetToken>,
  InferCreationAttributes<PasswordResetToken>
> {
  declare id: string;
  declare userId: string;
  declare token: string;
  declare expireAt: Date;
  declare used: CreationOptional<boolean>; // Mark 'used' as CreationOptional

  declare readonly user?: User;

  static initialize(sequelize: Sequelize) {
    PasswordResetToken.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true, // Add primaryKey as it's a primary key
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
        tableName: 'password_reset_tokens',
        timestamps: true,
      }
    );
  }
}

// src/database/models/user.model.ts
import {
  DataTypes,
  Model,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  HasManyAddAssociationMixin,
  BelongsToManyAddAssociationMixin,
} from 'sequelize';
import bcrypt from 'bcrypt';

import {Role} from './role.model';
import {RefreshToken} from './refresh-token.model';
import {PasswordResetToken} from './password-reset-token.model';
import {EmailVerificationToken} from './email-verification-token.model';

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<string>;
  declare username: string;
  declare email: string;
  declare profilePicture?: string;
  declare password: string;
  declare isVerified: CreationOptional<boolean>;
  declare status: CreationOptional<string>;
  declare roles?: Role[]; // Add this line for the roles association

  // Association mixins
  declare addRole: BelongsToManyAddAssociationMixin<Role, string>;
  declare addRefreshToken: HasManyAddAssociationMixin<RefreshToken, string>;
  declare addPasswordResetToken: HasManyAddAssociationMixin<PasswordResetToken, string>;
  declare addEmailVerificationToken: HasManyAddAssociationMixin<EmailVerificationToken, string>;

  static initialize(sequelize: Sequelize) {
    User.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        username: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        profilePicture: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: '',
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        isVerified: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        status: {
          type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'BANNED'),
          allowNull: false,
          defaultValue: 'ACTIVE',
        }
      },
      {
        sequelize,
        tableName: 'users',
        timestamps: true,
        hooks: {
          beforeCreate: async (user: User) => {
            if (user.password) {
              user.password = await bcrypt.hash(user.password, 10);
            }
          },
          beforeUpdate: async (user: User) => {
            if (user.changed('password') && user.password) {
              user.password = await bcrypt.hash(user.password, 10);
            }
          },
        },
      }
    );
  }
}

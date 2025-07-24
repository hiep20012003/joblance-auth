// src/database/models/user.model.ts
import { DataTypes, Model, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import bcrypt from 'bcrypt';

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<string>;
  declare username: string;
  declare email: string;
  declare password: string;
  declare is_verified: CreationOptional<boolean>;
  declare status: CreationOptional<string>;

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
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        is_verified: {
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

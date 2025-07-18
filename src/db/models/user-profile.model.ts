import { Model, DataTypes, Sequelize } from 'sequelize';

import { User } from './user.model';

export class UserProfile extends Model {
  declare id: number;
  declare user_id: number;
  declare full_name?: string;
  declare avatar?: string;
  declare phone?: string;
  declare gender?: 'male' | 'female' | 'other';
  declare dob?: Date;

  declare readonly user?: User;

  static initialize(sequelize: Sequelize) {
    UserProfile.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        full_name: {
          type: DataTypes.STRING,
        },
        avatar: {
          type: DataTypes.STRING,
        },
        phone: {
          type: DataTypes.STRING,
        },
        gender: {
          type: DataTypes.ENUM('male', 'female', 'other'),
        },
        dob: {
          type: DataTypes.DATE,
        },
      },
      {
        sequelize,
        tableName: 'user_profiles',
        timestamps: false,
      }
    );
  }
}

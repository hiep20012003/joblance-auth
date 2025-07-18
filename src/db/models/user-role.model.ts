import { Model, DataTypes, Sequelize } from 'sequelize';

export class UserRole extends Model {
  declare id: number;
  declare user_id: number;
  declare role_id: number;

  static initialize(sequelize: Sequelize) {
    UserRole.init(
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
        role_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'user_roles',
        timestamps: false,
      }
    );
  }
}

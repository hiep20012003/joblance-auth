import { Model, DataTypes, Sequelize } from 'sequelize';

export class UsersRoles extends Model {
  declare id: string;
  declare userId: string;
  declare roleId: string;

  static initialize(sequelize: Sequelize) {
    UsersRoles.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        roleId: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'users_roles',
        timestamps: true,
      }
    );
  }
}

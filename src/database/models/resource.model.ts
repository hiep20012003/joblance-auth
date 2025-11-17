import {
  DataTypes,
  Model,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

export class Resource extends Model<
  InferAttributes<Resource>,
  InferCreationAttributes<Resource>
> {
  declare id: CreationOptional<string>;
  declare name: string;

  static initialize(sequelize: Sequelize) {
    Resource.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
      },
      {
        sequelize,
        tableName: 'resources',
        timestamps: true,
      }
    );
  }
}

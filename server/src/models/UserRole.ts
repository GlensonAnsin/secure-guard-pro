import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

interface UserRoleAttributes {
  id: number;
  user_id: number;
  role_id: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserRoleCreationAttributes extends Optional<UserRoleAttributes, 'id' | 'created_at' | 'updated_at'> {}

class UserRole extends Model<UserRoleAttributes, UserRoleCreationAttributes> implements UserRoleAttributes {
  declare id: number;
  declare user_id: number;
  declare role_id: number;
  declare created_at: Date;
  declare updated_at: Date;

  static initModel(sequelize: Sequelize) {
    UserRole.init(
      {
        id: {
          type: DataTypes.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        user_id: {
          type: DataTypes.BIGINT,
          allowNull: false,
        },
        role_id: {
          type: DataTypes.BIGINT,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: 'UserRole',
        tableName: 'user_roles',
        timestamps: true,
        underscored: true,
      }
    );
  }

  static associate(models: any) {
    UserRole.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
    UserRole.belongsTo(models.Role, {
      foreignKey: 'role_id',
      as: 'role',
    });
  }
}

export default UserRole;

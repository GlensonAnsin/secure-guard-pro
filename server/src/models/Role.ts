import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

interface RoleAttributes {
  id: number;
  role_name: string;
  slug: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface RoleCreationAttributes extends Optional<RoleAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  declare id: number;
  declare role_name: string;
  declare slug: string;
  declare created_at: Date;
  declare updated_at: Date;

  static initModel(sequelize: Sequelize) {
    Role.init(
      {
        id: {
          type: DataTypes.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        role_name: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        slug: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: true,
        },
      },
      {
        sequelize,
        modelName: 'Role',
        tableName: 'roles',
        timestamps: true,
        underscored: true,
      }
    );
  }

  static associate(models: any) {
    Role.hasMany(models.UserRole, {
      foreignKey: 'role_id',
      as: 'userRoles',
    });
    Role.belongsToMany(models.User, {
      through: models.UserRole,
      foreignKey: 'role_id',
      otherKey: 'user_id',
      as: 'users',
    });
  }
}

export default Role;

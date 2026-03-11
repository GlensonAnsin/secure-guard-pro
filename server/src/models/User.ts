import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import Hash from '../utils/Hash.js';

interface UserAttributes {
  id: number;
  guard_id: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix: string | null;
  street: string | null;
  barangay: string;
  city_or_municipality: string;
  province: string;
  region: string;
  email: string | null;
  cel_num: string | null;
  username: string;
  password: string;
  is_available: boolean;
  is_on_leave: boolean;
  is_resigned: boolean;
  date_hired: Date;
  termination_date: Date | null;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'suffix' | 'is_available' | 'is_on_leave' | 'is_resigned' | 'created_at' | 'updated_at' | 'deleted_at'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: number;
  declare guard_id: string | null;
  declare first_name: string;
  declare middle_name: string | null;
  declare last_name: string;
  declare suffix: string | null;
  declare street: string | null;
  declare barangay: string;
  declare city_or_municipality: string;
  declare province: string;
  declare region: string;
  declare email: string | null;
  declare cel_num: string | null;
  declare username: string;
  declare password: string;
  declare is_available: boolean;
  declare is_on_leave: boolean;
  declare is_resigned: boolean;
  declare date_hired: Date;
  declare termination_date: Date | null;
  declare created_at: Date;
  declare updated_at: Date;
  declare deleted_at?: Date | null;

  // Virtual field populated via includes
  declare userRoles?: any[];
  declare roles?: any[];

  static initModel(sequelize: Sequelize) {
    User.init(
      {
        id: {
          type: DataTypes.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        guard_id: {
          type: DataTypes.STRING(255),
          allowNull: true,
          unique: true,
        },
        first_name: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        middle_name: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        last_name: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        suffix: {
          type: DataTypes.STRING(5),
          allowNull: true,
          defaultValue: null,
        },
        street: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        barangay: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        city_or_municipality: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        province: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        region: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING(255),
          allowNull: true,
          unique: true,
        },
        cel_num: {
          type: DataTypes.STRING(12),
          allowNull: true,
          unique: true,
        },
        username: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: true,
        },
        password: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        is_available: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        is_on_leave: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        is_resigned: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        date_hired: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        termination_date: {
          type: DataTypes.DATEONLY,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        paranoid: true,
        timestamps: true,
        underscored: true,
        hooks: {
          beforeCreate: async (user: User) => {
            if (user.password) {
              user.password = await Hash.make(user.password);
            }
          },
          beforeUpdate: async (user: User) => {
            if (user.changed('password')) {
              user.password = await Hash.make(user.password);
            }
          },
        },
      }
    );
  }

  static associate(models: any) {
    User.hasMany(models.Designation, {
      foreignKey: 'user_id',
      as: 'designations',
    });
    User.hasMany(models.FirearmIssuance, {
      foreignKey: 'user_id',
      as: 'firearmIssuances',
    });
    User.hasMany(models.UserRole, {
      foreignKey: 'user_id',
      as: 'userRoles',
    });
    User.belongsToMany(models.Role, {
      through: models.UserRole,
      foreignKey: 'user_id',
      otherKey: 'role_id',
      as: 'roles',
    });
  }
}

export default User;
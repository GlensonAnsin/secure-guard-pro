import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

interface CompanyAttributes {
  id: number;
  address: string;
  is_active: boolean;
  note: string | null;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

export interface CompanyCreationAttributes extends Optional<CompanyAttributes, 'id' | 'is_active' | 'note' | 'created_at' | 'updated_at' | 'deleted_at'> {}

class Company extends Model<CompanyAttributes, CompanyCreationAttributes> implements CompanyAttributes {
  declare id: number;
  declare address: string;
  declare is_active: boolean;
  declare note: string | null;
  declare created_at: Date;
  declare updated_at: Date;
  declare deleted_at?: Date | null;

  static initModel(sequelize: Sequelize) {
    Company.init(
      {
        id: {
          type: DataTypes.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        address: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        note: {
          type: DataTypes.TEXT,
          allowNull: true,
          defaultValue: null,
        },
      },
      {
        sequelize,
        modelName: 'Company',
        tableName: 'companies',
        paranoid: true,
        timestamps: true,
        underscored: true,
      }
    );
  }

  static associate(models: any) {
    Company.hasMany(models.Designation, {
      foreignKey: 'company_id',
      as: 'designations',
    });
  }
}

export default Company;

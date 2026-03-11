import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

interface DesignationAttributes {
  id: number;
  user_id: number;
  company_id: number;
  day_start: number;
  day_end: number;
  shift_in: string;
  shift_out: string;
  date_assigned: Date;
  date_of_dismissal: Date | null;
  last_shift_changes: Date | null;
  is_active: boolean;
  is_dismissed: boolean;
  is_completed: boolean;
  note: string | null;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

export interface DesignationCreationAttributes extends Optional<DesignationAttributes, 'id' | 'date_of_dismissal' | 'last_shift_changes' | 'is_active' | 'is_dismissed' | 'is_completed' | 'note' | 'created_at' | 'updated_at' | 'deleted_at'> {}

class Designation extends Model<DesignationAttributes, DesignationCreationAttributes> implements DesignationAttributes {
  declare id: number;
  declare user_id: number;
  declare company_id: number;
  declare day_start: number;
  declare day_end: number;
  declare shift_in: string;
  declare shift_out: string;
  declare date_assigned: Date;
  declare date_of_dismissal: Date | null;
  declare last_shift_changes: Date | null;
  declare is_active: boolean;
  declare is_dismissed: boolean;
  declare is_completed: boolean;
  declare note: string | null;
  declare created_at: Date;
  declare updated_at: Date;
  declare deleted_at?: Date | null;

  static initModel(sequelize: Sequelize) {
    Designation.init(
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
        company_id: {
          type: DataTypes.BIGINT,
          allowNull: false,
        },
        day_start: {
          type: DataTypes.TINYINT,
          allowNull: false,
        },
        day_end: {
          type: DataTypes.TINYINT,
          allowNull: false,
        },
        shift_in: {
          type: DataTypes.TIME,
          allowNull: false,
        },
        shift_out: {
          type: DataTypes.TIME,
          allowNull: false,
        },
        date_assigned: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        date_of_dismissal: {
          type: DataTypes.DATEONLY,
          allowNull: true,
          defaultValue: null,
        },
        last_shift_changes: {
          type: DataTypes.DATEONLY,
          allowNull: true,
          defaultValue: null,
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        is_dismissed: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        is_completed: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        note: {
          type: DataTypes.TEXT,
          allowNull: true,
          defaultValue: null,
        },
      },
      {
        sequelize,
        modelName: 'Designation',
        tableName: 'designations',
        paranoid: true,
        timestamps: true,
        underscored: true,
      }
    );
  }

  static associate(models: any) {
    Designation.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
    Designation.belongsTo(models.Company, {
      foreignKey: 'company_id',
      as: 'company',
    });
    Designation.hasMany(models.Attendance, {
      foreignKey: 'designation_id',
      as: 'attendances',
    });
  }
}

export default Designation;

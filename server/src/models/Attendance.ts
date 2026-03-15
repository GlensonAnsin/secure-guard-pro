import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

interface AttendanceAttributes {
  id: number;
  designation_id: number;
  time_in: Date;
  time_out: Date | null;
  hours_worked: number | null;
  is_present: boolean;
  is_late: boolean;
  is_early_in: boolean;
  is_early_out: boolean;
  note: string | null;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

export interface AttendanceCreationAttributes extends Optional<AttendanceAttributes, 'id' | 'time_out' | 'hours_worked' | 'is_present' | 'is_late' | 'is_early_in' | 'is_early_out' | 'note' | 'created_at' | 'updated_at' | 'deleted_at'> {}

class Attendance extends Model<AttendanceAttributes, AttendanceCreationAttributes> implements AttendanceAttributes {
  declare id: number;
  declare designation_id: number;
  declare time_in: Date;
  declare time_out: Date | null;
  declare hours_worked: number | null;
  declare is_present: boolean;
  declare is_late: boolean;
  declare is_early_in: boolean;
  declare is_early_out: boolean;
  declare note: string | null;
  declare created_at: Date;
  declare updated_at: Date;
  declare deleted_at?: Date | null;

  static initModel(sequelize: Sequelize) {
    Attendance.init(
      {
        id: {
          type: DataTypes.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        designation_id: {
          type: DataTypes.BIGINT,
          allowNull: false,
        },
        time_in: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        time_out: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: null,
        },
        hours_worked: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: null,
        },
        is_present: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        is_late: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        is_early_in: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        is_early_out: {
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
        modelName: 'Attendance',
        tableName: 'attendances',
        paranoid: true,
        timestamps: true,
        underscored: true,
      }
    );
  }

  static associate(models: any) {
    Attendance.belongsTo(models.Designation, {
      foreignKey: 'designation_id',
      as: 'designation',
    });
  }
}

export default Attendance;

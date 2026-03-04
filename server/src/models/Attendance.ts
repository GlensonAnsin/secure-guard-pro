import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

interface AttendanceAttributes {
  id: number;
  designation_id: number;
  time_in: Date;
  time_out: Date | null;
  hours_worked: number | null;
  status: string;
  note: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface AttendanceCreationAttributes extends Optional<AttendanceAttributes, 'id' | 'time_out' | 'hours_worked' | 'note' | 'created_at' | 'updated_at'> {}

class Attendance extends Model<AttendanceAttributes, AttendanceCreationAttributes> implements AttendanceAttributes {
  declare id: number;
  declare designation_id: number;
  declare time_in: Date;
  declare time_out: Date | null;
  declare hours_worked: number | null;
  declare status: string;
  declare note: string | null;
  declare created_at: Date;
  declare updated_at: Date;

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
        status: {
          type: DataTypes.STRING(255),
          allowNull: false,
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

import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

interface DesignationAttributes {
  id: number;
  user_id: number;
  client: string;
  address: string;
  shift_in: string;
  shift_out: string;
  date_assigned: Date;
  date_of_dismissal: Date | null;
  status: string;
  note: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface DesignationCreationAttributes extends Optional<DesignationAttributes, 'id' | 'date_of_dismissal' | 'note' | 'created_at' | 'updated_at'> {}

class Designation extends Model<DesignationAttributes, DesignationCreationAttributes> implements DesignationAttributes {
  declare id: number;
  declare user_id: number;
  declare client: string;
  declare address: string;
  declare shift_in: string;
  declare shift_out: string;
  declare date_assigned: Date;
  declare date_of_dismissal: Date | null;
  declare status: string;
  declare note: string | null;
  declare created_at: Date;
  declare updated_at: Date;

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
        client: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        address: {
          type: DataTypes.TEXT,
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
        modelName: 'Designation',
        tableName: 'designations',
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
    Designation.hasMany(models.Attendance, {
      foreignKey: 'designation_id',
      as: 'attendances',
    });
  }
}

export default Designation;

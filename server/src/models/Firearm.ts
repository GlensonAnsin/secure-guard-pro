import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

interface FirearmAttributes {
  id: number;
  type: string;
  serial_num: string;
  exp_of_registration: Date;
  is_available: boolean;
  is_damaged: boolean;
  is_maintenance: boolean;
  is_expiring: boolean;
  is_expired: boolean;
  note: string | null;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

export interface FirearmCreationAttributes extends Optional<FirearmAttributes, 'id' | 'is_available' | 'is_damaged' | 'is_maintenance' | 'is_expiring' | 'is_expired' | 'note' | 'created_at' | 'updated_at' | 'deleted_at'> {}

class Firearm extends Model<FirearmAttributes, FirearmCreationAttributes> implements FirearmAttributes {
  declare id: number;
  declare type: string;
  declare serial_num: string;
  declare exp_of_registration: Date;
  declare is_available: boolean;
  declare is_damaged: boolean;
  declare is_maintenance: boolean;
  declare is_expiring: boolean;
  declare is_expired: boolean;
  declare note: string | null;
  declare created_at: Date;
  declare updated_at: Date;
  declare deleted_at?: Date | null;

  static initModel(sequelize: Sequelize) {
    Firearm.init(
      {
        id: {
          type: DataTypes.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        type: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        serial_num: {
          type: DataTypes.TEXT,
          allowNull: false,
          unique: true,
        },
        exp_of_registration: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        is_available: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        is_damaged: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        is_maintenance: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        is_expiring: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        is_expired: {
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
        modelName: 'Firearm',
        tableName: 'firearms',
        paranoid: true,
        timestamps: true,
        underscored: true,
      }
    );
  }

  static associate(models: any) {
    Firearm.hasMany(models.FirearmIssuance, {
      foreignKey: 'firearm_id',
      as: 'issuances',
    });
  }
}

export default Firearm;

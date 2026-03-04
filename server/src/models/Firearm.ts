import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

interface FirearmAttributes {
  id: number;
  type: string;
  serial_num: string;
  exp_of_registration: Date;
  status: string;
  note: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface FirearmCreationAttributes extends Optional<FirearmAttributes, 'id' | 'note' | 'created_at' | 'updated_at'> {}

class Firearm extends Model<FirearmAttributes, FirearmCreationAttributes> implements FirearmAttributes {
  declare id: number;
  declare type: string;
  declare serial_num: string;
  declare exp_of_registration: Date;
  declare status: string;
  declare note: string | null;
  declare created_at: Date;
  declare updated_at: Date;

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
        },
        exp_of_registration: {
          type: DataTypes.DATEONLY,
          allowNull: false,
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
        modelName: 'Firearm',
        tableName: 'firearms',
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

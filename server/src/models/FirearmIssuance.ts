import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

interface FirearmIssuanceAttributes {
  id: number;
  user_id: number;
  firearm_id: number;
  date_of_issuance: Date;
  turn_in_date: Date | null;
  note: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface FirearmIssuanceCreationAttributes extends Optional<FirearmIssuanceAttributes, 'id' | 'turn_in_date' | 'note' | 'created_at' | 'updated_at'> {}

class FirearmIssuance extends Model<FirearmIssuanceAttributes, FirearmIssuanceCreationAttributes> implements FirearmIssuanceAttributes {
  declare id: number;
  declare user_id: number;
  declare firearm_id: number;
  declare date_of_issuance: Date;
  declare turn_in_date: Date | null;
  declare note: string | null;
  declare created_at: Date;
  declare updated_at: Date;

  static initModel(sequelize: Sequelize) {
    FirearmIssuance.init(
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
        firearm_id: {
          type: DataTypes.BIGINT,
          allowNull: false,
        },
        date_of_issuance: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        turn_in_date: {
          type: DataTypes.DATEONLY,
          allowNull: true,
          defaultValue: null,
        },
        note: {
          type: DataTypes.TEXT,
          allowNull: true,
          defaultValue: null,
        },
      },
      {
        sequelize,
        modelName: 'FirearmIssuance',
        tableName: 'firearm_issuances',
        timestamps: true,
        underscored: true,
      }
    );
  }

  static associate(models: any) {
    FirearmIssuance.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
    FirearmIssuance.belongsTo(models.Firearm, {
      foreignKey: 'firearm_id',
      as: 'firearm',
    });
  }
}

export default FirearmIssuance;

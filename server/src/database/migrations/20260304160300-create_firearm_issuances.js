import { DataTypes } from 'sequelize';

class CreateFirearmIssuancesTable {
  /**
   * Run the migrations.
   */
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('firearm_issuances', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.BIGINT,
      },
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      firearm_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: 'firearms',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('firearm_issuances', ['user_id']);
    await queryInterface.addIndex('firearm_issuances', ['firearm_id']);
  }

  /**
   * Reverse the migrations.
   */
  async down(queryInterface) {
    await queryInterface.dropTable('firearm_issuances');
  }
}

export default new CreateFirearmIssuancesTable();

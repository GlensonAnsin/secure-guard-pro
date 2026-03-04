import { DataTypes } from 'sequelize';

class CreateFirearmsTable {
  /**
   * Run the migrations.
   */
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('firearms', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.BIGINT,
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
  }

  /**
   * Reverse the migrations.
   */
  async down(queryInterface) {
    await queryInterface.dropTable('firearms');
  }
}

export default new CreateFirearmsTable();

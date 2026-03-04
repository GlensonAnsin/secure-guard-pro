import { DataTypes } from 'sequelize';

class CreateUserTable {
  /**
   * Run the migrations.
   */
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.BIGINT,
      },
      guard_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
      },
      first_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      middle_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      last_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      suffix: {
        type: DataTypes.STRING(5),
        allowNull: true,
        defaultValue: null,
      },
      role: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      street: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      barangay: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      city_or_municipality: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      province: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      region: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
      },
      cel_num: {
        type: DataTypes.STRING(12),
        allowNull: true,
        unique: true,
      },
      username: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      date_hired: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      termination_date: {
        type: DataTypes.DATEONLY,
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
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
    });
  }

  /**
   * Reverse the migrations.
   */
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
}

export default new CreateUserTable();
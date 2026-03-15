import { DataTypes } from 'sequelize';

class CreateAttendancesTable {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('attendances', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.BIGINT,
      },
      designation_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: 'designations',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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

    await queryInterface.addIndex('attendances', ['designation_id']);
  }

  async down(queryInterface) {
    await queryInterface.dropTable('attendances');
  }
}

export default new CreateAttendancesTable();

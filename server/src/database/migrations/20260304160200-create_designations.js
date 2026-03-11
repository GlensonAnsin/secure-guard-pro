import { DataTypes } from 'sequelize';

class CreateDesignationsTable {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('designations', {
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
      company_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: 'companies',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      day_start: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
      },
      day_end: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 5,
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
      last_shift_changes: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        defaultValue: null,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      is_dismissed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_completed: {
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

    await queryInterface.addIndex('designations', ['user_id']);
    await queryInterface.addIndex('designations', ['company_id']);
  }

  async down(queryInterface) {
    await queryInterface.dropTable('designations');
  }
}

export default new CreateDesignationsTable();

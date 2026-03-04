import { DataTypes } from 'sequelize';

class CreateDesignationsTable {
  /**
   * Run the migrations.
   */
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

    await queryInterface.addIndex('designations', ['user_id']);
  }

  /**
   * Reverse the migrations.
   */
  async down(queryInterface) {
    await queryInterface.dropTable('designations');
  }
}

export default new CreateDesignationsTable();

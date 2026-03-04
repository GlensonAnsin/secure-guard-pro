import UserFactory from '../factories/UserFactory.js';
import FirearmFactory from '../factories/FirearmFactory.js';
import FirearmIssuanceFactory from '../factories/FirearmIssuanceFactory.js';
import DesignationFactory from '../factories/DesignationFactory.js';
import AttendanceFactory from '../factories/AttendanceFactory.js';
import Logger from '../../utils/Logger.js';

class DatabaseSeeder {
  /**
   * Run the database seeds.
   */
  async run() {
    Logger.info('Seeding database...');

    try {
      // 1. Create a specific Admin User
      const admin = await UserFactory.create({
        guard_id: null,
        first_name: 'Admin',
        middle_name: null,
        last_name: 'SecureGuard',
        email: 'admin@secureguard.com',
        cel_num: null,
        username: 'admin@secureguard.com',
        password: 'secureguard.admin',
        role: 'admin',
        status: 'active',
        street: null,
        barangay: 'Carmen',
        city_or_municipality: 'Cagayan de Oro City',
        province: 'Misamis Oriental',
        region: 'Northern Mindanao',
        date_hired: Date(),
      });

      const hr = await UserFactory.create({
        guard_id: null,
        first_name: 'HR',
        middle_name: null,
        last_name: 'SecureGuard',
        email: 'hr@secureguard.com',
        cel_num: null,
        username: 'hr@secureguard.com',
        password: 'secureguard.hr',
        role: 'hr',
        status: 'active',
        street: null,
        barangay: 'Carmen',
        city_or_municipality: 'Cagayan de Oro City',
        province: 'Misamis Oriental',
        region: 'Northern Mindanao',
        date_hired: Date(),
      });

      // 2. Create random guard users
      const users = await UserFactory.createMany(20);

      // 3. Create firearms
      const firearms = await FirearmFactory.createMany(10);

      // 4. Create designations for users
      const allUsers = [admin, hr, ...users];
      const designations = [];

      for (const user of allUsers.slice(0, 15)) {
        const designation = await DesignationFactory.create({
          user_id: user.id,
        });
        designations.push(designation);
      }

      // 5. Create firearm issuances
      for (let i = 0; i < 10; i++) {
        const user = allUsers[i % allUsers.length];
        const firearm = firearms[i % firearms.length];

        await FirearmIssuanceFactory.create({
          user_id: user.id,
          firearm_id: firearm.id,
        });
      }

      // 6. Create attendances for designations
      for (const designation of designations) {
        const count = Math.floor(Math.random() * 5) + 1;
        for (let i = 0; i < count; i++) {
          await AttendanceFactory.create({
            designation_id: designation.id,
          });
        }
      }

      Logger.info('Seeding complete!');
    } catch (error) {
      Logger.error('Seeding failed:', error);
      throw error;
    }
  }
}

export default new DatabaseSeeder();
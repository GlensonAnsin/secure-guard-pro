import UserFactory from '../factories/UserFactory.js';
import FirearmFactory from '../factories/FirearmFactory.js';
import FirearmIssuanceFactory from '../factories/FirearmIssuanceFactory.js';
import DesignationFactory from '../factories/DesignationFactory.js';
import AttendanceFactory from '../factories/AttendanceFactory.js';
import CompanyFactory from '../factories/CompanyFactory.js';
import Role from '../../models/Role.js';
import UserRole from '../../models/UserRole.js';
import Logger from '../../utils/Logger.js';

class DatabaseSeeder {
  /**
   * Run the database seeds.
   */
  async run() {
    Logger.info('Seeding database...');

    try {
      // 1. Create Roles
      const [adminRole] = await Role.findOrCreate({ 
        where: { slug: 'admin' },
        defaults: { role_name: 'Administrator' }
      });
      const [hrRole] = await Role.findOrCreate({
        where: { slug: 'hr' },
        defaults: { role_name: 'Human Resources' }
      });
      const [guardRole] = await Role.findOrCreate({
        where: { slug: 'guard' },
        defaults: { role_name: 'Security Guard' }
      });

      // 2. Create Companies
      const companies = await CompanyFactory.createMany(5);

      // 3. Create Admin User
      const admin = await UserFactory.create({
        guard_id: null,
        first_name: 'Admin',
        middle_name: null,
        last_name: 'SecureGuard',
        email: 'admin@secureguard.com',
        cel_num: null,
        username: 'admin@secureguard.com',
        password: 'secureguard.admin',
        street: null,
        barangay: 'Carmen',
        city_or_municipality: 'Cagayan de Oro City',
        province: 'Misamis Oriental',
        region: 'Northern Mindanao',
        is_available: true,
        is_on_leave: false,
        is_resigned: false,
        date_hired: new Date(),
      });
      await UserRole.create({ user_id: admin.id, role_id: adminRole.id });

      // 4. Create HR User
      const hr = await UserFactory.create({
        guard_id: null,
        first_name: 'HR',
        middle_name: null,
        last_name: 'SecureGuard',
        email: 'hr@secureguard.com',
        cel_num: null,
        username: 'hr@secureguard.com',
        password: 'secureguard.hr',
        street: null,
        barangay: 'Carmen',
        city_or_municipality: 'Cagayan de Oro City',
        province: 'Misamis Oriental',
        region: 'Northern Mindanao',
        is_available: true,
        is_on_leave: false,
        is_resigned: false,
        date_hired: new Date(),
      });
      await UserRole.create({ user_id: hr.id, role_id: hrRole.id });

      // 5. Create random guard users
      const users = await UserFactory.createMany(20);
      for (const user of users) {
        await UserRole.create({ user_id: user.id, role_id: guardRole.id });
      }

      // 6. Create firearms
      const firearms = await FirearmFactory.createMany(10);

      // 7. Create designations for guards
      const designations = [];
      for (let i = 0; i < Math.min(15, users.length); i++) {
        const user = users[i];
        const company = companies[i % companies.length];
        const designation = await DesignationFactory.create({
          user_id: user.id,
          company_id: company.id,
        });
        designations.push(designation);

        if (designation.is_active) {
          await user.update({ is_available: false });
        }
      }

      // 8. Create firearm issuances (only for available firearms)
      const availableFirearms = firearms.filter(f => f.is_available && !f.is_expired && !f.is_maintenance);
      for (let i = 0; i < Math.min(availableFirearms.length, users.length); i++) {
        const user = users[i];
        const firearm = availableFirearms[i];

        await FirearmIssuanceFactory.create({
          user_id: user.id,
          firearm_id: firearm.id,
        });

        await firearm.update({ is_available: false });
      }

      // 9. Create attendances for designations
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
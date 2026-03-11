import { faker } from '@faker-js/faker';
import Firearm from '../../models/Firearm.js';
import Factory from './Factory.js';

class FirearmFactory extends Factory<Firearm> {
  protected model = Firearm;

  protected definition() {
    const types = ['9mm Pistol', 'Shotgun 12 Gauge', '.38 Revolver', '.45 Caliber Pistol'];

    return {
      type: faker.helpers.arrayElement(types),
      serial_num: faker.string.alphanumeric(12).toUpperCase(),
      exp_of_registration: faker.date.future({ years: 2 }),
      is_available: true,
      is_damaged: false,
      is_maintenance: faker.datatype.boolean({ probability: 0.15 }),
      is_expiring: false,
      is_expired: faker.datatype.boolean({ probability: 0.1 }),
      note: faker.datatype.boolean() ? faker.lorem.sentence() : null,
    };
  }
}

export default new FirearmFactory();

import { faker } from '@faker-js/faker';
import FirearmIssuance from '../../models/FirearmIssuance.js';
import Factory from './Factory.js';

class FirearmIssuanceFactory extends Factory<FirearmIssuance> {
  protected model = FirearmIssuance;

  protected definition() {
    const issuanceDate = faker.date.past({ years: 1 });

    return {
      user_id: 1,
      firearm_id: 1,
      date_of_issuance: issuanceDate,
      turn_in_date: faker.datatype.boolean() ? faker.date.future({ years: 1, refDate: issuanceDate }) : null,
      note: faker.datatype.boolean() ? faker.lorem.sentence() : null,
    };
  }
}

export default new FirearmIssuanceFactory();

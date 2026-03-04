import { Model, ModelStatic } from 'sequelize';

export default abstract class Factory<T extends Model> {
  protected abstract model: ModelStatic<T>;

  // abstract method where you define the default state
  protected abstract definition(): Record<string, any>;

  // Make a single object (not saved to DB)
  public make(overrides: Record<string, any> = {}): Record<string, any> {
    return {
      ...this.definition(),
      ...overrides,
    };
  }

  // Make multiple objects (not saved to DB)
  public makeMany(count: number, overrides: Record<string, any> = {}): Record<string, any>[] {
    return Array.from({ length: count }).map(() => this.make(overrides));
  }

  // Create single record in DB
  public async create(overrides: Record<string, any> = {}): Promise<T> {
    const data = this.make(overrides);
    return await this.model.create(data as any);
  }

  // Create multiple records in DB
  public async createMany(count: number, overrides: Record<string, any> = {}): Promise<T[]> {
    const data = this.makeMany(count, overrides);
    return await this.model.bulkCreate(data as any);
  }
}
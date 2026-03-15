import { z } from 'zod';

class UserRequest {
  /**
   * Rules for creating a user.
   */
  public static store = z.object({
    first_name: z.string().min(2, 'First name must be at least 2 characters').regex(/^[A-Za-z\s]+$/, 'First name must contain only letters'),
    middle_name: z.string().regex(/^[A-Za-z\s]+$/, 'Middle name must contain only letters').optional().nullable(),
    last_name: z.string().min(2, 'Last name must be at least 2 characters').regex(/^[A-Za-z\s]+$/, 'Last name must contain only letters'),
    suffix: z.string().regex(/^[A-Za-z\s]*$/, 'Suffix must contain only letters').optional().nullable(),
    cel_num: z.string().length(11, 'Contact number must be exactly 11 digits').regex(/^\d+$/, 'Contact number must contain only numbers').optional().nullable(),
    email: z.string().email('Invalid email address').optional().nullable(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    username: z.string(),
    role: z.string(),
    barangay: z.string(),
    city_or_municipality: z.string(),
    province: z.string(),
    region: z.string(),
    status: z.string(),
    date_hired: z.string(), // ISO string date
  }).passthrough();

  /**
   * Rules for updating a user.
   */
  public static update = z.object({
    first_name: z.string().min(2).regex(/^[A-Za-z\s]+$/, 'First name must contain only letters').optional(),
    middle_name: z.string().regex(/^[A-Za-z\s]+$/, 'Middle name must contain only letters').optional().nullable(),
    last_name: z.string().min(2).regex(/^[A-Za-z\s]+$/, 'Last name must contain only letters').optional(),
    suffix: z.string().regex(/^[A-Za-z\s]*$/, 'Suffix must contain only letters').optional().nullable(),
    cel_num: z.string().length(12, 'Contact number must be exactly 12 digits').regex(/^\d+$/, 'Contact number must contain only numbers').optional().nullable(),
    email: z.string().email().optional().nullable(), 
  }).passthrough();
}

export default UserRequest;
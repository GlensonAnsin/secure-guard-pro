import { z } from 'zod';

class UserRequest {
  /**
   * Rules for creating a user.
   */
  public static store = z.object({
    first_name: z.string().min(2, 'First name must be at least 2 characters'),
    last_name: z.string().min(2, 'Last name must be at least 2 characters'),
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
  }).passthrough(); // Allow other fields like guard_id, cel_num, etc

  /**
   * Rules for updating a user.
   */
  public static update = z.object({
    // fields optional for updates
    first_name: z.string().min(2).optional(),
    last_name: z.string().min(2).optional(),
    email: z.string().email().optional().nullable(), 
  }).passthrough();
}

export default UserRequest;
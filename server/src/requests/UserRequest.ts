import { z } from 'zod';

class UserRequest {
  /**
   * Rules for creating a user.
   */
  public static store = z.object({
    firstname: z.string().min(2, 'First name must be at least 2 characters'),
    lastname: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    // Optional: role is not required here if you default it in the database
  });

  /**
   * Rules for updating a user.
   */
  public static update = z.object({
    // fields optional for updates
    firstname: z.string().min(2).optional(),
    lastname: z.string().min(2).optional(),
    email: z.string().email().optional(), 
  });
}

export default UserRequest;
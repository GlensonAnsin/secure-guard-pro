import { z } from 'zod';

class CompanyRequest {
  /**
   * Rules for creating a company.
   */
  public static store = z.object({
    name: z.string().min(2, 'Company name must be at least 2 characters').regex(/^[A-Za-z\s&.]+$/, 'Company name must contain only letters and common special characters'),
    address: z.string().min(5, 'Address must be at least 5 characters'),
    note: z.string().optional().nullable(),
    is_active: z.boolean().optional(),
  }).passthrough();

  /**
   * Rules for updating a company.
   */
  public static update = z.object({
    name: z.string().min(2).regex(/^[A-Za-z\s&.]+$/, 'Company name must contain only letters and common special characters').optional(),
    address: z.string().min(5).optional(),
    note: z.string().optional().nullable(),
    is_active: z.boolean().optional(),
  }).passthrough();
}

export default CompanyRequest;

import { Request, Response, NextFunction } from 'express';
import CompanyService from '../services/CompanyService.js';
import ApiResponse from '../utils/ApiResponse.js';

class CompanyController {
  public async index(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 15;
      const search = req.query.search as string;
      const status = req.query.status as string;
      const companies = await CompanyService.getAllCompanies(page, limit, search, status);
      return ApiResponse.success(res, companies, 'Companies retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  public async show(req: Request, res: Response, next: NextFunction) {
    try {
      const company = await CompanyService.getCompanyById(Number(req.params.id));
      if (!company) return ApiResponse.error(res, 'Company not found', 404);
      return ApiResponse.success(res, company, 'Company retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  public async store(req: Request, res: Response, next: NextFunction) {
    try {
      const company = await CompanyService.createCompany(req.body);
      return ApiResponse.success(res, company, 'Company created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction) {
    try {
      const company = await CompanyService.updateCompany(Number(req.params.id), req.body);
      return ApiResponse.success(res, company, 'Company updated successfully');
    } catch (error) {
      next(error);
    }
  }

  public async destroy(req: Request, res: Response, next: NextFunction) {
    try {
      await CompanyService.deleteCompany(Number(req.params.id));
      return ApiResponse.success(res, null, 'Company deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all guards assigned to a company with shift info.
   */
  public async getGuards(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CompanyService.getCompanyGuards(Number(req.params.id));
      return ApiResponse.success(res, result, 'Company guards retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new CompanyController();

import { departmentRepository } from '../repositories/departmentRepository.js';
import { IDepartment } from '../models/Department.js';
import { IncidentCategory } from '@civicpulse/shared';
import { cacheService } from './cacheService.js';

export class DepartmentService {
  async getDepartments(): Promise<IDepartment[]> {
    return cacheService.wrap('departments:all', 300, async () => {
      return departmentRepository.findAll();
    });
  }

  async getDepartmentById(id: string): Promise<IDepartment | null> {
    return cacheService.wrap(`department:${id}`, 300, async () => {
      return departmentRepository.findById(id);
    });
  }

  async getDepartmentByCode(code: string): Promise<IDepartment | null> {
    return cacheService.wrap(`department:code:${code}`, 300, async () => {
      return departmentRepository.findByCode(code);
    });
  }

  async getDepartmentsForCategory(category: IncidentCategory): Promise<IDepartment[]> {
    return cacheService.wrap(`departments:category:${category}`, 300, async () => {
      return departmentRepository.findByCategory(category);
    });
  }
}

export const departmentService = new DepartmentService();

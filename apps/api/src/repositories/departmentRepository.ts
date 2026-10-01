import mongoose from 'mongoose';
import { IDepartment, DepartmentModel } from '../models/Department.js';
import { IncidentCategory } from '@civicpulse/shared';

export class DepartmentRepository {
  async create(data: Partial<IDepartment>): Promise<IDepartment> {
    return DepartmentModel.create(data);
  }

  async findById(id: string): Promise<IDepartment | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return DepartmentModel.findById(id);
  }

  async findByCode(code: string): Promise<IDepartment | null> {
    return DepartmentModel.findOne({ code: code.toUpperCase() });
  }

  async findByCategory(category: IncidentCategory): Promise<IDepartment[]> {
    return DepartmentModel.find({ categories: category, isActive: true });
  }

  async findAll(): Promise<IDepartment[]> {
    return DepartmentModel.find({ isActive: true }).sort({ name: 1 });
  }
}

export const departmentRepository = new DepartmentRepository();

import mongoose from 'mongoose';
import { IUser, UserModel } from '../models/User.js';
import { UserRole } from '@civicpulse/shared';
import { PaginationParams, PaginatedResult, sanitizePagination, FilterQuery } from './baseRepository.js';

export class UserRepository {
  async create(data: Partial<IUser>): Promise<IUser> {
    return UserModel.create(data);
  }

  async findById(id: string): Promise<IUser | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return UserModel.findById(id).populate('departmentId', 'name code').populate('teamId', 'name');
  }

  async findByEmail(email: string, includePassword = false): Promise<IUser | null> {
    const query = UserModel.findOne({ email: email.toLowerCase().trim() });
    if (includePassword) {
      query.select('+passwordHash');
    }
    return query;
  }

  async findWithPagination(
    filter: { role?: UserRole; departmentId?: string; isActive?: boolean } = {},
    pagination?: PaginationParams
  ): Promise<PaginatedResult<IUser>> {
    const { page, limit, skip } = sanitizePagination(pagination);
    const query: FilterQuery<IUser> = {};

    if (filter.role) query.role = filter.role;
    if (filter.departmentId && mongoose.Types.ObjectId.isValid(filter.departmentId)) {
      query.departmentId = new mongoose.Types.ObjectId(filter.departmentId);
    }
    if (typeof filter.isActive === 'boolean') {
      query.isActive = filter.isActive;
    }

    const [data, total] = await Promise.all([
      UserModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      UserModel.countDocuments(query),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
    return UserModel.findByIdAndUpdate(id, data, { returnDocument: 'after' });
  }
}

export const userRepository = new UserRepository();

import { userRepository } from '../repositories/userRepository.js';
import { IUser } from '../models/User.js';
import { UserRole } from '@civicpulse/shared';
import { PaginationParams, PaginatedResult } from '../repositories/baseRepository.js';

export class UserService {
  async getUserById(id: string): Promise<IUser | null> {
    return userRepository.findById(id);
  }

  async getUserByEmail(email: string, includePassword = false): Promise<IUser | null> {
    return userRepository.findByEmail(email, includePassword);
  }

  async listUsers(
    filter?: { role?: UserRole; departmentId?: string; isActive?: boolean },
    pagination?: PaginationParams
  ): Promise<PaginatedResult<IUser>> {
    return userRepository.findWithPagination(filter, pagination);
  }
}

export const userService = new UserService();

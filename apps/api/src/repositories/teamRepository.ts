import mongoose from 'mongoose';
import { ITeam, TeamModel, TeamAvailabilityStatus } from '../models/Team.js';
import { FilterQuery } from './baseRepository.js';

export class TeamRepository {
  async create(data: Partial<ITeam>): Promise<ITeam> {
    return TeamModel.create(data);
  }

  async findById(id: string): Promise<ITeam | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return TeamModel.findById(id).populate('departmentId').populate('officerIds', 'name email role');
  }

  async findAll(filter: { departmentId?: string; availabilityStatus?: TeamAvailabilityStatus; wardId?: string } = {}): Promise<ITeam[]> {
    const query: FilterQuery<ITeam> = { isActive: true };

    if (filter.departmentId && mongoose.Types.ObjectId.isValid(filter.departmentId)) {
      query.departmentId = new mongoose.Types.ObjectId(filter.departmentId);
    }
    if (filter.availabilityStatus) {
      query.availabilityStatus = filter.availabilityStatus;
    }
    if (filter.wardId) {
      query.wardIds = filter.wardId;
    }

    return TeamModel.find(query).populate('departmentId', 'name code').sort({ name: 1 });
  }

  /**
   * 2dsphere Geospatial Search: Find teams near a target incident coordinate
   */
  async findNearbyTeams(
    coordinates: [number, number],
    maxDistanceMeters: number = 5000,
    departmentId?: string,
    availabilityStatus: TeamAvailabilityStatus = 'AVAILABLE'
  ): Promise<ITeam[]> {
    const query: FilterQuery<ITeam> = {
      isActive: true,
      availabilityStatus,
      currentLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates, // [longitude, latitude]
          },
          $maxDistance: maxDistanceMeters,
        },
      },
    };

    if (departmentId && mongoose.Types.ObjectId.isValid(departmentId)) {
      query.departmentId = new mongoose.Types.ObjectId(departmentId);
    }

    return TeamModel.find(query).limit(10);
  }

  async updateWorkload(teamId: string, delta: number): Promise<ITeam | null> {
    return TeamModel.findByIdAndUpdate(
      teamId,
      { $inc: { activeWorkload: delta } },
      { returnDocument: 'after' }
    );
  }

  async setAvailability(teamId: string, status: TeamAvailabilityStatus): Promise<ITeam | null> {
    return TeamModel.findByIdAndUpdate(teamId, { availabilityStatus: status }, { returnDocument: 'after' });
  }
}

export const teamRepository = new TeamRepository();

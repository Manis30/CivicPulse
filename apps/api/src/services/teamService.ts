import { teamRepository } from '../repositories/teamRepository.js';
import { ITeam, TeamAvailabilityStatus } from '../models/Team.js';

export class TeamService {
  async getTeams(filter?: { departmentId?: string; availabilityStatus?: TeamAvailabilityStatus; wardId?: string }): Promise<ITeam[]> {
    return teamRepository.findAll(filter);
  }

  async getTeamById(id: string): Promise<ITeam | null> {
    return teamRepository.findById(id);
  }

  async findNearbyTeams(
    coordinates: [number, number],
    radiusMeters = 5000,
    departmentId?: string,
    availabilityStatus: TeamAvailabilityStatus = 'AVAILABLE'
  ): Promise<ITeam[]> {
    return teamRepository.findNearbyTeams(coordinates, radiusMeters, departmentId, availabilityStatus);
  }

  async updateTeamAvailability(teamId: string, status: TeamAvailabilityStatus): Promise<ITeam | null> {
    return teamRepository.setAvailability(teamId, status);
  }
}

export const teamService = new TeamService();

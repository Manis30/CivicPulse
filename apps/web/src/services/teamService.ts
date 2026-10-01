import { apiClient } from './apiClient';

export interface TeamInfo {
  id: string;
  name: string;
  departmentId?: string;
  wardIds: string[];
  specializations: string[];
  capacity: number;
  activeWorkload: number;
  availabilityStatus: 'AVAILABLE' | 'BUSY' | 'OFF_DUTY';
  currentLocation?: {
    type: 'Point';
    coordinates: [number, number];
  };
  shift: 'DAY' | 'NIGHT' | 'ROTATING';
  isActive: boolean;
}

export const PREVIEW_TEAMS: TeamInfo[] = [
  {
    id: 'team-alpha-01',
    name: 'Rapid Asphalt Team Alpha',
    wardIds: ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4'],
    specializations: ['POTHOLE', 'ROAD_DAMAGE'],
    capacity: 5,
    activeWorkload: 2,
    availabilityStatus: 'AVAILABLE',
    shift: 'DAY',
    isActive: true,
  },
  {
    id: 'team-water-fast',
    name: 'Water Main Emergency Squad',
    wardIds: ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5'],
    specializations: ['WATER_LEAK'],
    capacity: 4,
    activeWorkload: 3,
    availabilityStatus: 'BUSY',
    shift: 'DAY',
    isActive: true,
  },
];

export const teamService = {
  async getTeams(departmentId?: string): Promise<TeamInfo[]> {
    try {
      const response = await apiClient.get('/teams', {
        params: departmentId ? { departmentId } : {},
      });
      if (response.data?.success && Array.isArray(response.data?.data)) {
        return response.data.data.map((t: any) => ({
          id: t._id || t.id,
          name: t.name,
          departmentId: t.departmentId?._id || t.departmentId,
          wardIds: t.wardIds || [],
          specializations: t.specializations || [],
          capacity: t.capacity ?? 4,
          activeWorkload: t.activeWorkload ?? 0,
          availabilityStatus: t.availabilityStatus || 'AVAILABLE',
          currentLocation: t.currentLocation,
          shift: t.shift || 'DAY',
          isActive: t.isActive ?? true,
        }));
      }
    } catch (err) {
      console.info('[teamService] Live API unavailable. Using preview fallback.', err);
    }
    return PREVIEW_TEAMS;
  },
};

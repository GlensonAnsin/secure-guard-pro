import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

export interface User {
  id: number;
  guard_id: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix: string | null;
  role: string;
  street: string | null;
  barangay: string;
  city_or_municipality: string;
  province: string;
  region: string;
  email: string | null;
  cel_num: string | null;
  is_available: boolean;
  is_on_leave: boolean;
  is_resigned: boolean;
  date_hired: string;
}

export interface Designation {
  id: number;
  user_id: number;
  client: string;
  address: string;
  shift_in: string;
  shift_out: string;
  day_start: number;
  day_end: number;
  date_assigned: string;
  date_of_dismissal: string | null;
  status: string;
  note: string | null;
}

export interface Firearm {
  id: number;
  type: string;
  serial_num: string;
  exp_of_registration: string;
}

export interface FirearmIssuance {
  id: number;
  user_id: number;
  firearm_id: number;
  date_of_issuance: string;
  turn_in_date: string | null;
  note: string | null;
  firearm?: Firearm;
}

export interface Attendance {
  id: number;
  designation_id: number;
  time_in: string;
  time_out: string | null;
  hours_worked: number | null;
  status: string;
  statuses?: string[];
  note: string | null;
}

export interface GuardProfile {
  user: User;
  designation: Designation | null;
  designationHistory: Designation[];
  currentFirearm: FirearmIssuance | null;
  firearmHistory: FirearmIssuance[];
  latestAttendance: Attendance | null;
}

export const authService = {
  login: async (username: string, password: string): Promise<GuardProfile & { accessToken: string; refreshToken: string }> => {
    const response = await api.post('/mobile/login', { username, password });
    const { user, accessToken, refreshToken } = response.data;

    // Store tokens
    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
    await AsyncStorage.setItem('user', JSON.stringify(user));

    return response.data;
  },

  logout: async (): Promise<void> => {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user', 'guardProfile']);
  },

  getToken: async (): Promise<string | null> => {
    return await AsyncStorage.getItem('accessToken');
  },

  getUser: async (): Promise<User | null> => {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem('accessToken');
    return !!token;
  },

  getProfile: async (): Promise<GuardProfile> => {
    const response = await api.get('/mobile/me');
    const profile = response.data;

    // Cache profile locally
    await AsyncStorage.setItem('guardProfile', JSON.stringify(profile));

    return profile;
  },

  getCachedProfile: async (): Promise<GuardProfile | null> => {
    const cached = await AsyncStorage.getItem('guardProfile');
    return cached ? JSON.parse(cached) : null;
  },

  getAttendances: async (): Promise<Attendance[]> => {
    const response = await api.get('/mobile/attendances');
    return response.data;
  },

  timeIn: async (designationId: number, timestamp?: string): Promise<Attendance> => {
    const response = await api.post('/mobile/time-in', { 
      designation_id: designationId,
      timestamp 
    });
    return response.data;
  },

  timeOut: async (attendanceId: number, timestamp?: string): Promise<Attendance> => {
    const response = await api.post('/mobile/time-out', { 
      attendance_id: attendanceId,
      timestamp 
    });
    return response.data;
  },
};

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
  status: string;
  date_hired: string;
}

export interface Designation {
  id: number;
  user_id: number;
  client: string;
  address: string;
  shift_in: string;
  shift_out: string;
  date_assigned: string;
  date_of_dismissal: string | null;
  status: string;
  note: string | null;
}

export interface Attendance {
  id: number;
  designation_id: number;
  time_in: string;
  time_out: string | null;
  hours_worked: number | null;
  status: string;
  note: string | null;
}

export interface GuardProfile {
  user: User;
  designation: Designation | null;
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

  timeIn: async (designationId: number): Promise<Attendance> => {
    const response = await api.post('/mobile/time-in', { designation_id: designationId });
    return response.data;
  },

  timeOut: async (attendanceId: number): Promise<Attendance> => {
    const response = await api.post('/mobile/time-out', { attendance_id: attendanceId });
    return response.data;
  },
};

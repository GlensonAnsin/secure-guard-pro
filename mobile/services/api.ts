import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://10.0.2.2:3000/api'; // Android emulator
// For physical device, use your computer's IP address, e.g., 'http://192.168.1.x:3000/api'
// For iOS simulator, use 'http://localhost:3000/api'

// Try to detect the best base URL
function getBaseUrl(): string {
  // For web (Expo web), use relative or localhost
  if (typeof window !== 'undefined' && (window as any).location?.hostname) {
    const hostname = (window as any).location.hostname;
    return `http://${hostname}:3000/api`;
  }
  return API_BASE_URL;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = getBaseUrl();
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await AsyncStorage.getItem('accessToken');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async get(endpoint: string): Promise<any> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }
    return data;
  }

  async post(endpoint: string, body?: any): Promise<any> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }
    return data;
  }

  async put(endpoint: string, body?: any): Promise<any> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }
    return data;
  }
}

export const api = new ApiClient();

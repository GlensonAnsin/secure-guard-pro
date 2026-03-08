import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from './auth';

interface PendingAction {
  id: string;
  type: 'time_in' | 'time_out';
  payload: any;
  createdAt: string;
}

const PENDING_ACTIONS_KEY = 'pendingActions';

export const syncService = {
  /**
   * Add a pending action to the queue.
   */
  addPendingAction: async (type: 'time_in' | 'time_out', payload: any): Promise<void> => {
    const actions = await syncService.getPendingActions();
    const action: PendingAction = {
      id: Date.now().toString(),
      type,
      payload,
      createdAt: new Date().toISOString(),
    };
    actions.push(action);
    await AsyncStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify(actions));
  },

  /**
   * Get all pending actions.
   */
  getPendingActions: async (): Promise<PendingAction[]> => {
    const data = await AsyncStorage.getItem(PENDING_ACTIONS_KEY);
    return data ? JSON.parse(data) : [];
  },

  /**
   * Process all pending actions (sync with server).
   */
  syncPendingActions: async (): Promise<void> => {
    const actions = await syncService.getPendingActions();
    if (actions.length === 0) return;

    const remaining: PendingAction[] = [];

    for (const action of actions) {
      try {
        if (action.type === 'time_in') {
          await authService.timeIn(action.payload.designation_id);
        } else if (action.type === 'time_out') {
          await authService.timeOut(action.payload.attendance_id);
        }
        // Successfully synced, don't add to remaining
      } catch {
        // Failed to sync, keep in queue
        remaining.push(action);
      }
    }

    await AsyncStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify(remaining));
  },

  /**
   * Refresh profile data from server.
   */
  syncProfile: async (): Promise<void> => {
    try {
      await authService.getProfile();
    } catch (error) {
      // Silently fail - cached data will be used
      console.log('Failed to sync profile:', error);
    }
  },

  /**
   * Check if device is online.
   */
  isOnline: async (): Promise<boolean> => {
    const state = await NetInfo.fetch();
    return state.isConnected === true;
  },

  /**
   * Subscribe to network changes and auto-sync when back online.
   */
  startNetworkListener: (onSync?: () => void): (() => void) => {
    const unsubscribe = NetInfo.addEventListener(async (state: NetInfoState) => {
      if (state.isConnected) {
        await syncService.syncPendingActions();
        await syncService.syncProfile();
        onSync?.();
      }
    });
    return unsubscribe;
  },
};

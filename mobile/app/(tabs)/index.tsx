import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { authService, Attendance } from '../../services/auth';
import { syncService } from '../../services/sync';
import { AppColors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '../../constants/theme';
import { Building2, MapPin, Clock, FileText, Square, Info, Play } from 'lucide-react-native';

export default function HomeScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTimingIn, setIsTimingIn] = useState(false);
  const [isTimingOut, setIsTimingOut] = useState(false);
  const [activeAttendance, setActiveAttendance] = useState<Attendance | null>(null);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refreshProfile();
    setIsRefreshing(false);
  }, [refreshProfile]);

  // Format time as HH:MM:SS AM/PM
  const formatTime = (date: Date): string => {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes}:${seconds} ${ampm}`;
  };

  // Format date
  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Format shift time for display (HH:MM:SS -> H:MM AM/PM)
  const formatShiftTime = (timeStr: string): string => {
    if (!timeStr) return '--:--';
    const parts = timeStr.split(':');
    let hours = parseInt(parts[0]);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  const getShiftBoundaries = useCallback(() => {
    if (!profile?.designation) return null;
    const now = currentTime;
    
    const [shiftInH, shiftInM] = profile.designation.shift_in.split(':').map(Number);
    const [shiftOutH, shiftOutM] = profile.designation.shift_out.split(':').map(Number);
    
    const shiftInDate = new Date(now);
    shiftInDate.setHours(shiftInH, shiftInM, 0, 0);
    
    const shiftOutDate = new Date(now);
    shiftOutDate.setHours(shiftOutH, shiftOutM, 0, 0);

    let start = new Date(shiftInDate);
    let end = new Date(shiftOutDate);

    // Handle overnight shifts
    if (shiftInH > shiftOutH || (shiftInH === shiftOutH && shiftInM > shiftOutM)) {
      if (now.getHours() < shiftInH) { // We are before the numerical shift_in hour
        // Check if we are close to the shift start (Early In window, e.g., within 4 hours)
        const diffHours = (shiftInDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        if (diffHours > 4) {
          // Far from start, we are likely in the tail end of the shift that started yesterday
          start.setDate(start.getDate() - 1);
        } else {
          // Within early-in window, the shift starts today and ends tomorrow
          end.setDate(end.getDate() + 1);
        }
      } else { // It is 10 PM right now for a 10 PM shift, the shift ends tomorrow
        end.setDate(end.getDate() + 1);
      }
    }

    return { start, end };
  }, [profile?.designation, currentTime]);

  const shiftBoundaries = getShiftBoundaries();

  const isWorkingDay = (): boolean => {
    if (!profile?.designation) return false;
    const { day_start, day_end } = profile.designation;
    const today = currentTime.getDay();
    
    if (day_start <= day_end) {
      return today >= day_start && today <= day_end;
    } else {
      return today >= day_start || today <= day_end;
    }
  };

  const hasTimedInThisShift = useCallback(() => {
    if (!shiftBoundaries || !profile?.latestAttendance) return false;
    const timeIn = new Date(profile.latestAttendance.time_in);
    
    // Add a 4-hour buffer for "Early In" clock-ins
    const bufferStart = new Date(shiftBoundaries.start);
    bufferStart.setHours(bufferStart.getHours() - 4);
    
    return timeIn >= bufferStart && timeIn <= shiftBoundaries.end;
  }, [shiftBoundaries, profile?.latestAttendance]);

  const evaluatedActiveAttendance = profile?.latestAttendance && !profile.latestAttendance.time_out && hasTimedInThisShift() 
    ? profile.latestAttendance 
    : null;

  useEffect(() => {
    setActiveAttendance(evaluatedActiveAttendance);
  }, [evaluatedActiveAttendance]);

  const alreadyCompletedShift = profile?.latestAttendance && !!profile.latestAttendance.time_out && hasTimedInThisShift();
  
  const isOnLeave = profile?.user?.is_on_leave;
  
  // Guard is absent if the shift has ended and they never timed in
  const isAbsent = !activeAttendance && !alreadyCompletedShift && shiftBoundaries && currentTime > shiftBoundaries.end;

  const canTimeIn = !activeAttendance && !alreadyCompletedShift && !isOnLeave && !isAbsent && profile?.designation && isWorkingDay();

  const handleTimeIn = async () => {
    if (!profile?.designation || isOnLeave) return;
    setIsTimingIn(true);
    try {
      const online = await syncService.isOnline();
      if (online) {
        const attendance = await authService.timeIn(profile.designation.id);
        setActiveAttendance(attendance);
        await refreshProfile();
      } else {
        await syncService.addPendingAction('time_in', {
          designation_id: profile.designation.id,
        });
        // Show optimistic local attendance
        setActiveAttendance({
          id: -1,
          designation_id: profile.designation.id,
          time_in: new Date().toISOString(),
          time_out: null,
          hours_worked: null,
          status: 'on_duty',
          note: 'Pending sync',
        });
        Alert.alert('Offline', 'Time in recorded locally. It will sync when you are back online.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to time in');
    } finally {
      setIsTimingIn(false);
    }
  };

  const handleTimeOut = async () => {
    if (!activeAttendance) return;
    Alert.alert(
      'Confirm Time Out',
      'Are you sure you want to time out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Time Out',
          style: 'destructive',
          onPress: async () => {
            setIsTimingOut(true);
            try {
              const online = await syncService.isOnline();
              if (online && activeAttendance.id !== -1) {
                await authService.timeOut(activeAttendance.id);
                setActiveAttendance(null);
                await refreshProfile();
              } else {
                if (activeAttendance.id !== -1) {
                  await syncService.addPendingAction('time_out', {
                    attendance_id: activeAttendance.id,
                  });
                }
                setActiveAttendance(null);
                Alert.alert('Offline', 'Time out recorded locally. It will sync when you are back online.');
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to time out');
            } finally {
              setIsTimingOut(false);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'assigned':
      case 'present':
      case 'completed':
        return AppColors.success;
      case 'resigned':
      case 'dismissed':
      case 'absent':
        return AppColors.danger;
      case 'on_leave':
      case 'late':
      case 'early_out':
        return AppColors.warning;
      case 'early_in':
      case 'on_duty':
        return AppColors.info || '#3b82f6';
      default:
        return AppColors.textMuted;
    }
  };

  const guardName = user
    ? `${user.first_name} ${user.last_name}${user.suffix ? ` ${user.suffix}` : ''}`
    : 'Guard';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={AppColors.primaryDark} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.guardName} numberOfLines={1}>{guardName}</Text>
            <View style={styles.guardIdBadge}>
              <Text style={styles.guardIdText}>ID: {user?.guard_id || 'N/A'}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/profile')}
            activeOpacity={0.7}
          >
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>
                {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={AppColors.accent}
            colors={[AppColors.accent]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Time & Date Card */}
        <View style={styles.timeCard}>
          <View style={styles.timeCardInner}>
            <Text style={styles.currentTime}>{formatTime(currentTime)}</Text>
            <Text style={styles.currentDate}>{formatDate(currentTime)}</Text>
            {activeAttendance && (
              <View style={styles.onDutyBadge}>
                <View style={styles.pulseDot} />
                <Text style={styles.onDutyText}>ON DUTY</Text>
              </View>
            )}
          </View>
        </View>

        {/* Assignment Card */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Current Assignment</Text>
        </View>
        {profile?.designation ? (
          <View style={styles.assignmentCard}>
            <View style={styles.assignmentRow}>
              <View style={styles.assignmentIconContainer}>
                <Building2 size={18} color={AppColors.textSecondary} />
              </View>
              <View style={styles.assignmentInfo}>
                <Text style={styles.assignmentLabel}>Client</Text>
                <Text style={styles.assignmentValue}>{profile.designation.client}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.assignmentRow}>
              <View style={styles.assignmentIconContainer}>
                <MapPin size={18} color={AppColors.textSecondary} />
              </View>
              <View style={styles.assignmentInfo}>
                <Text style={styles.assignmentLabel}>Location</Text>
                <Text style={styles.assignmentValue}>{profile.designation.address}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.assignmentRow}>
              <View style={styles.assignmentIconContainer}>
                <Clock size={18} color={AppColors.textSecondary} />
              </View>
              <View style={styles.assignmentInfo}>
                <Text style={styles.assignmentLabel}>Shift Schedule</Text>
                <Text style={styles.assignmentValue}>
                  {formatShiftTime(profile.designation.shift_in)} — {formatShiftTime(profile.designation.shift_out)}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.noAssignmentCard}>
            <FileText size={32} color={AppColors.textMuted} style={{ marginBottom: Spacing.md }} />
            <Text style={styles.noAssignmentText}>No Active Assignment</Text>
            <Text style={styles.noAssignmentSubtext}>Contact your supervisor for assignment details</Text>
          </View>
        )}

        {/* Time In/Out Buttons */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Attendance</Text>
        </View>
        <View style={styles.attendanceCard}>
          {activeAttendance ? (
            <>
              <View style={styles.timedInInfo}>
                <Text style={styles.timedInTime}>
                  {formatTime(new Date(activeAttendance.time_in))}
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: Spacing.sm, justifyContent: 'center' }}>
                  {(activeAttendance.statuses && activeAttendance.statuses.length > 0 ? activeAttendance.statuses : [activeAttendance.status || 'unknown']).map((s, i) => (
                    <View key={i} style={[styles.statusBadge, { backgroundColor: `${getStatusColor(s)}20` }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(s) }]}>
                        {s.replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
              <TouchableOpacity
                style={[styles.timeButton, styles.timeOutButton]}
                onPress={handleTimeOut}
                disabled={isTimingOut}
                activeOpacity={0.8}
              >
                {isTimingOut ? (
                  <ActivityIndicator color={AppColors.white} size="small" />
                ) : (
                  <>
                    <Square size={18} color={AppColors.white} style={{ marginRight: Spacing.sm }} />
                    <Text style={styles.timeButtonText}>Time Out</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              {!canTimeIn && profile?.designation && (
                <View style={[styles.shiftNotice, isOnLeave && { backgroundColor: `${AppColors.danger}15` }]}>
                  <Info size={14} color={isOnLeave || isAbsent ? AppColors.danger : AppColors.accent} style={{ marginRight: Spacing.sm }} />
                  <Text style={[styles.shiftNoticeText, (isOnLeave || isAbsent) && { color: AppColors.danger }]}>
                    {isOnLeave
                      ? "You are currently on leave."
                      : isAbsent
                      ? "You were marked absent for this shift."
                      : !isWorkingDay()
                      ? "Today is not your scheduled working day."
                      : alreadyCompletedShift
                      ? "You have already completed your shift for today."
                      : `Time In will be available at ${formatShiftTime(profile.designation.shift_in)}`}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                style={[
                  styles.timeButton,
                  styles.timeInButton,
                  !canTimeIn && styles.timeButtonDisabled,
                ]}
                onPress={handleTimeIn}
                disabled={!canTimeIn || isTimingIn}
                activeOpacity={0.8}
              >
                {isTimingIn ? (
                  <ActivityIndicator color={AppColors.white} size="small" />
                ) : (
                  <>
                    <Play size={18} color={AppColors.white} style={{ marginRight: Spacing.sm }} />
                    <Text style={[styles.timeButtonText, !canTimeIn && styles.timeButtonTextDisabled]}>
                      Time In
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={{ height: Spacing.xxxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    backgroundColor: AppColors.primary,
    paddingTop: 66,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.xxl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
    marginRight: Spacing.lg,
  },
  greeting: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 2,
  },
  guardName: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: AppColors.white,
    marginBottom: Spacing.sm,
  },
  guardIdBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  guardIdText: {
    color: AppColors.accentLight,
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
    letterSpacing: 0.5,
  },
  profileButton: {
    padding: Spacing.xs,
  },
  profileAvatar: {
    width: 70,
    height: 70,
    borderRadius: 70,
    backgroundColor: AppColors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  profileAvatarText: {
    color: AppColors.white,
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xxl,
    paddingTop: Spacing.xl,
  },
  // Time Card
  timeCard: {
    backgroundColor: AppColors.primary,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.xxl,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  timeCardInner: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  currentTime: {
    fontSize: FontSizes.display,
    fontWeight: FontWeights.extrabold,
    color: AppColors.white,
    letterSpacing: 2,
  },
  currentDate: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.5)',
    marginTop: Spacing.xs,
  },
  onDutyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.lg,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AppColors.success,
    marginRight: Spacing.sm,
  },
  onDutyText: {
    color: AppColors.success,
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    letterSpacing: 1.5,
  },
  // Sections
  sectionHeader: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: AppColors.textPrimary,
  },
  // Assignment Card
  assignmentCard: {
    backgroundColor: AppColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.xxl,
    ...Shadows.md,
  },
  assignmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  assignmentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: AppColors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  assignmentInfo: {
    flex: 1,
  },
  assignmentLabel: {
    fontSize: FontSizes.xs,
    color: AppColors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  assignmentValue: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: AppColors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.borderLight,
    marginLeft: 56,
  },
  noAssignmentCard: {
    backgroundColor: AppColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xxxl,
    marginBottom: Spacing.xxl,
    alignItems: 'center',
    ...Shadows.md,
  },
  noAssignmentText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: AppColors.textPrimary,
    marginBottom: Spacing.xs,
  },
  noAssignmentSubtext: {
    fontSize: FontSizes.sm,
    color: AppColors.textMuted,
    textAlign: 'center',
  },
  // Attendance Card
  attendanceCard: {
    backgroundColor: AppColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  timedInInfo: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  timedInLabel: {
    fontSize: FontSizes.sm,
    color: AppColors.textMuted,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timedInTime: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: AppColors.success,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginLeft: Spacing.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: FontWeights.bold,
    letterSpacing: 0.5,
  },
  timeButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 56,
    borderRadius: BorderRadius.md,
    ...Shadows.md,
  },
  timeInButton: {
    backgroundColor: AppColors.success,
  },
  timeOutButton: {
    backgroundColor: AppColors.danger,
  },
  timeButtonDisabled: {
    backgroundColor: AppColors.disabled,
    ...Shadows.sm,
  },
  timeButtonText: {
    color: AppColors.white,
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    letterSpacing: 0.5,
  },
  timeButtonTextDisabled: {
    color: AppColors.disabledText,
  },
  shiftNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.infoLight,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  shiftNoticeText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: AppColors.accent,
    fontWeight: FontWeights.medium,
  },
});

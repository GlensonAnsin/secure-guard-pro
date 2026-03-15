import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { authService, Attendance } from '../services/auth';
import { AppColors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '../constants/theme';
import { IdCard, User, Phone, Mail, MapPin, Calendar, Building2, Clock, FileText, LogOut, ChevronLeft, Shield } from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, profile, logout } = useAuth();
  const router = useRouter();
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loadingAttendances, setLoadingAttendances] = useState(true);

  useEffect(() => {
    const fetchAttendances = async () => {
      try {
        if (user) {
          const data = await authService.getAttendances();
          setAttendances(data);
        }
      } catch (error) {
        console.error('Failed to fetch attendances:', error);
      } finally {
        setLoadingAttendances(false);
      }
    };

    fetchAttendances();
  }, [user]);

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateStr: string | null | undefined): string => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getDayName = (day: number | undefined): string => {
    if (day === undefined || day === null) return 'N/A';
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day] || 'N/A';
  };

  const formatShiftTime = (timeStr: string | undefined): string => {
    if (!timeStr) return '--:--';
    const parts = timeStr.split(':');
    let hours = parseInt(parts[0]);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  const displayUser = profile?.user || user;

  const fullName = displayUser
    ? `${displayUser.first_name}${displayUser.middle_name ? ` ${displayUser.middle_name}` : ''} ${displayUser.last_name}${displayUser.suffix ? ` ${displayUser.suffix}` : ''}`
    : 'Guard';

  const fullAddress = user
    ? [user.street, user.barangay, user.city_or_municipality, user.province, user.region]
        .filter(Boolean)
        .join(', ')
    : 'N/A';

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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={AppColors.primaryDark} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ChevronLeft size={24} color={AppColors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Profile Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
            </Text>
          </View>
          <Text style={styles.profileName}>{fullName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(displayUser?.status)}20` }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(displayUser?.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(displayUser?.status) }]}>
              {displayUser?.status === 'assigned' ? 'Assigned' : displayUser?.status === 'unassigned' ? 'Unassigned' : displayUser?.status === 'on_leave' ? 'On Leave' : displayUser?.status === 'resigned' ? 'Resigned' : displayUser?.status ? (displayUser.status.charAt(0).toUpperCase() + displayUser.status.slice(1)) : 'N/A'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Personal Information */}
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.card}>
          <InfoRow icon={IdCard} label="Guard ID" value={user?.guard_id || 'N/A'} />
          <InfoDivider />
          <InfoRow icon={User} label="Full Name" value={fullName} />
          <InfoDivider />
          <InfoRow icon={Phone} label="Cellphone Number" value={user?.cel_num || 'N/A'} />
          <InfoDivider />
          <InfoRow icon={Mail} label="Email Address" value={user?.email || 'N/A'} />
          <InfoDivider />
          <InfoRow icon={MapPin} label="Full Address" value={fullAddress} />
          <InfoDivider />
          <InfoRow icon={Calendar} label="Date Hired" value={formatDate(user?.date_hired)} />
        </View>

        {/* Current Assignment */}
        <Text style={styles.sectionTitle}>Current Assignment</Text>
        {profile?.designation ? (
          <View style={styles.card}>
            <InfoRow icon={Building2} label="Client Name" value={profile.designation.client} />
            <InfoDivider />
            <InfoRow icon={MapPin} label="Assignment Address" value={profile.designation.address} />
            <InfoDivider />
            <InfoRow
              icon={Clock}
              label="Shift Schedule"
              value={`${formatShiftTime(profile.designation.shift_in)} — ${formatShiftTime(profile.designation.shift_out)}`}
            />
            <InfoDivider />
            <InfoRow
              icon={Calendar}
              label="Work Days"
              value={`${getDayName(profile.designation.day_start)} to ${getDayName(profile.designation.day_end)}`}
            />
            <InfoDivider />
            <InfoRow icon={Calendar} label="Date Assigned" value={formatDate(profile.designation.date_assigned)} />
            <InfoDivider />
            <InfoRow
              icon={FileText}
              label="Assignment Status"
              value={profile.designation.status ? (profile.designation.status.charAt(0).toUpperCase() + profile.designation.status.slice(1)) : 'N/A'}
              valueColor={getStatusColor(profile.designation.status)}
            />
          </View>
        ) : (
          <View style={styles.noDataCard}>
            <FileText size={32} color={AppColors.textMuted} style={{ marginBottom: Spacing.md }} />
            <Text style={styles.noDataText}>No Active Assignment</Text>
          </View>
        )}

        {/* Current Issued Firearm */}
        <Text style={styles.sectionTitle}>Current Issued Firearm</Text>
        {profile?.currentFirearm ? (
          <View style={styles.card}>
            <InfoRow icon={Shield} label="Firearm Type" value={profile.currentFirearm.firearm?.type || 'N/A'} />
            <InfoDivider />
            <InfoRow icon={FileText} label="Serial Number" value={profile.currentFirearm.firearm?.serial_num || 'N/A'} />
            <InfoDivider />
            <InfoRow icon={Calendar} label="Issued Date" value={formatDate(profile.currentFirearm.date_of_issuance)} />
          </View>
        ) : (
          <View style={styles.noDataCard}>
            <Shield size={32} color={AppColors.textMuted} style={{ marginBottom: Spacing.md }} />
            <Text style={styles.noDataText}>No Issued Firearm</Text>
          </View>
        )}

        {/* Designation History */}
        <Text style={styles.sectionTitle}>Designation History</Text>
        <View style={styles.card}>
          {profile?.designationHistory && profile.designationHistory.length > 0 ? (
            profile.designationHistory.map((des, index) => (
              <View key={des.id}>
                <View style={{ marginVertical: Spacing.sm }}>
                  <Text style={{ fontSize: FontSizes.md, fontWeight: FontWeights.bold, color: AppColors.textPrimary }}>
                    {des.client}
                  </Text>
                  <Text style={{ fontSize: FontSizes.sm, color: AppColors.textSecondary, marginTop: 2 }}>
                    {formatDate(des.date_assigned)} {des.date_of_dismissal ? ` - ${formatDate(des.date_of_dismissal)}` : '(Current)'}
                  </Text>
                  <Text style={{ fontSize: FontSizes.xs, color: AppColors.textMuted, marginTop: 2 }}>
                    {des.address}
                  </Text>
                </View>
                {index < profile.designationHistory.length - 1 && <InfoDivider />}
              </View>
            ))
          ) : (
            <View style={{ padding: Spacing.md, alignItems: 'center' }}>
              <Text style={styles.noDataText}>No history found</Text>
            </View>
          )}
        </View>

        {/* Firearm Issuance History */}
        <Text style={styles.sectionTitle}>Firearm Issuance History</Text>
        <View style={styles.card}>
          {profile?.firearmHistory && profile.firearmHistory.length > 0 ? (
            profile.firearmHistory.map((fi, index) => (
              <View key={fi.id}>
                <View style={{ marginVertical: Spacing.sm }}>
                  <Text style={{ fontSize: FontSizes.md, fontWeight: FontWeights.bold, color: AppColors.textPrimary }}>
                    {fi.firearm?.type} ({fi.firearm?.serial_num})
                  </Text>
                  <Text style={{ fontSize: FontSizes.sm, color: AppColors.textSecondary, marginTop: 2 }}>
                    Issued: {formatDate(fi.date_of_issuance)}
                  </Text>
                  {fi.turn_in_date && (
                    <Text style={{ fontSize: FontSizes.sm, color: AppColors.textMuted, marginTop: 2 }}>
                      Returned: {formatDate(fi.turn_in_date)}
                    </Text>
                  )}
                </View>
                {index < profile.firearmHistory.length - 1 && <InfoDivider />}
              </View>
            ))
          ) : (
            <View style={{ padding: Spacing.md, alignItems: 'center' }}>
              <Text style={styles.noDataText}>No history found</Text>
            </View>
          )}
        </View>

        {/* Attendance History */}
        <Text style={styles.sectionTitle}>Attendance History</Text>
        <View style={styles.card}>
          {loadingAttendances ? (
            <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={AppColors.primary} />
            </View>
          ) : attendances.length > 0 ? (
            attendances.map((attendance, index) => (
              <View key={attendance.id}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: Spacing.sm }}>
                  <View>
                    <Text style={{ fontSize: FontSizes.md, fontWeight: FontWeights.medium, color: AppColors.textPrimary }}>
                      In: {formatDateTime(attendance.time_in)}
                    </Text>
                    {attendance.time_out && (
                      <Text style={{ fontSize: FontSizes.sm, color: AppColors.textSecondary, marginTop: 2 }}>
                        Out: {formatDateTime(attendance.time_out)}
                      </Text>
                    )}
                  </View>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'flex-end', flex: 1 }}>
                    {(attendance.statuses && attendance.statuses.length > 0 ? attendance.statuses : [attendance.status || 'unknown']).map((s, i) => (
                      <View key={i} style={[styles.statusBadge, { backgroundColor: `${getStatusColor(s)}20`, paddingHorizontal: Spacing.sm, paddingVertical: 4, marginLeft: 4 }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(s), fontSize: 10 }]}>
                          {s.replace('_', ' ').toUpperCase()}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
                {index < attendances.length - 1 && <InfoDivider />}
              </View>
            ))
          ) : (
            <View style={styles.noDataCard}>
              <Clock size={32} color={AppColors.textMuted} style={{ marginBottom: Spacing.md }} />
              <Text style={styles.noDataText}>No Attendance History</Text>
            </View>
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <LogOut size={18} color={AppColors.danger} style={{ marginRight: Spacing.sm }} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>SecureGuard Pro v1.0.0</Text>

        <View style={{ height: Spacing.xxxxl }} />
      </ScrollView>
    </View>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  valueColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={infoStyles.row}>
      <View style={infoStyles.iconContainer}>
        <Icon size={18} color={AppColors.textSecondary} />
      </View>
      <View style={infoStyles.textContainer}>
        <Text style={infoStyles.label}>{label}</Text>
        <Text style={[infoStyles.value, valueColor ? { color: valueColor } : null]}>{value}</Text>
      </View>
    </View>
  );
}

function InfoDivider() {
  return <View style={infoStyles.divider} />;
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: AppColors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: FontSizes.xs,
    color: AppColors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  value: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    color: AppColors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.borderLight,
    marginLeft: 52,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    backgroundColor: AppColors.primary,
    paddingTop: 56,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.xxl,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: AppColors.white,
  },
  headerSpacer: {
    width: 40,
  },
  avatarSection: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: AppColors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.25)',
    marginBottom: Spacing.md,
  },
  avatarText: {
    color: AppColors.white,
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
  },
  profileName: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: AppColors.white,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  statusText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: AppColors.textPrimary,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  card: {
    backgroundColor: AppColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    ...Shadows.md,
  },
  noDataCard: {
    backgroundColor: AppColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xxxl,
    marginBottom: Spacing.xl,
    alignItems: 'center',
    ...Shadows.md,
  },
  noDataText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    color: AppColors.textMuted,
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.dangerLight,
    borderRadius: BorderRadius.md,
    height: 52,
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderColor: `${AppColors.danger}30`,
  },
  logoutText: {
    color: AppColors.danger,
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
  },
  versionText: {
    textAlign: 'center',
    color: AppColors.textMuted,
    fontSize: FontSizes.xs,
    marginTop: Spacing.xl,
  },
});

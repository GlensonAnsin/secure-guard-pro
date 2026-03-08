import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { AppColors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '../constants/theme';
import { IdCard, User, Phone, Mail, MapPin, Calendar, Building2, Clock, FileText, LogOut, ChevronLeft } from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, profile, logout } = useAuth();
  const router = useRouter();

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

  const formatShiftTime = (timeStr: string | undefined): string => {
    if (!timeStr) return '--:--';
    const parts = timeStr.split(':');
    let hours = parseInt(parts[0]);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  const fullName = user
    ? `${user.first_name}${user.middle_name ? ` ${user.middle_name}` : ''} ${user.last_name}${user.suffix ? ` ${user.suffix}` : ''}`
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
      case 'completed':
        return AppColors.success;
      case 'resigned':
      case 'dismissed':
        return AppColors.danger;
      case 'on_leave':
        return AppColors.warning;
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
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(user?.status)}20` }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(user?.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(user?.status) }]}>
              {user?.status === 'assigned' ? 'Assigned' : user?.status === 'unassigned' ? 'Unassigned' : user?.status === 'on_leave' ? 'On Leave' : user?.status === 'resigned' ? 'Resigned' : user?.status}
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
            <InfoRow icon={Calendar} label="Date Assigned" value={formatDate(profile.designation.date_assigned)} />
            <InfoDivider />
            <InfoRow
              icon={FileText}
              label="Assignment Status"
              value={profile.designation.status?.charAt(0).toUpperCase() + profile.designation.status?.slice(1)}
              valueColor={getStatusColor(profile.designation.status)}
            />
          </View>
        ) : (
          <View style={styles.noDataCard}>
            <FileText size={32} color={AppColors.textMuted} style={{ marginBottom: Spacing.md }} />
            <Text style={styles.noDataText}>No Active Assignment</Text>
          </View>
        )}

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
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
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
    fontSize: FontSizes.lg,
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

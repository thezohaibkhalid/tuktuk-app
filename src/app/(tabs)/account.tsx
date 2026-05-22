import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/auth';

type RowProps = {
  label: string;
  description?: string;
  onPress?: () => void;
  trailing?: string;
};

function Row({ label, description, onPress, trailing }: RowProps) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
      <View style={styles.rowText}>
        <ThemedText style={styles.rowLabel}>{label}</ThemedText>
        {description ? (
          <ThemedText themeColor="textSecondary" style={styles.rowDescription}>
            {description}
          </ThemedText>
        ) : null}
      </View>
      <ThemedText themeColor="textLight" style={styles.rowTrailing}>
        {trailing ?? '›'}
      </ThemedText>
    </Pressable>
  );
}

export default function AccountScreen() {
  const router = useRouter();
  const theme = useTheme();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const logout = useAuthStore((s) => s.logout);

  if (!hydrated) {
    return (
      <ThemedView style={styles.fill}>
        <SafeAreaView edges={['top']} style={styles.center}>
          <ActivityIndicator color={theme.primary} />
        </SafeAreaView>
      </ThemedView>
    );
  }

  const onLogout = () => {
    Alert.alert('Log out?', 'You will need to sign in again to check out.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => void logout() },
    ]);
  };

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView edges={['top']} style={styles.fill}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <ThemedText style={styles.headerTitle}>Account</ThemedText>
          </View>

          {user ? (
            <View
              style={[
                styles.profileCard,
                { backgroundColor: theme.surface, borderColor: theme.borderLight },
              ]}>
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: theme.primaryLight },
                ]}>
                {user.image ? (
                  <Image
                    source={{ uri: user.image }}
                    contentFit="cover"
                    style={StyleSheet.absoluteFill}
                  />
                ) : (
                  <ThemedText style={[styles.avatarInitial, { color: theme.secondary }]}>
                    {(user.firstName?.[0] ?? user.email[0] ?? '?').toUpperCase()}
                  </ThemedText>
                )}
              </View>
              <View style={styles.profileText}>
                <ThemedText style={styles.profileName}>
                  {user.firstName} {user.lastName}
                </ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.profileEmail}>
                  {user.email}
                </ThemedText>
                {!user.emailVerifiedAt ? (
                  <View
                    style={[
                      styles.verifyChip,
                      { backgroundColor: theme.warningLight },
                    ]}>
                    <ThemedText
                      style={[styles.verifyChipText, { color: theme.warning }]}>
                      Email not verified
                    </ThemedText>
                  </View>
                ) : null}
              </View>
            </View>
          ) : (
            <View
              style={[
                styles.signInCard,
                { backgroundColor: theme.primaryLight, borderColor: theme.primaryBorder },
              ]}>
              <ThemedText style={[styles.signInTitle, { color: theme.secondary }]}>
                Sign in to your account
              </ThemedText>
              <ThemedText
                style={[styles.signInBody, { color: theme.secondary }]}>
                Track orders, save addresses, and check out faster.
              </ThemedText>
              <View style={styles.signInRow}>
                <Pressable
                  onPress={() => router.push('/auth/login' as never)}
                  style={[styles.signInBtn, { backgroundColor: theme.primary }]}>
                  <ThemedText
                    style={[styles.signInBtnText, { color: theme.secondary }]}>
                    Sign in
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => router.push('/auth/register' as never)}
                  style={[styles.signInBtnGhost, { borderColor: theme.secondary }]}>
                  <ThemedText
                    style={[styles.signInBtnText, { color: theme.secondary }]}>
                    Create account
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          )}

          <View style={styles.section}>
            <ThemedText themeColor="textSecondary" style={styles.sectionLabel}>
              SHOPPING
            </ThemedText>
            <Row
              label="Orders"
              description="Track and view your past purchases"
              onPress={() =>
                user
                  ? router.push('/orders' as never)
                  : router.push('/auth/login' as never)
              }
            />
            <Row
              label="Addresses"
              description="Manage your shipping addresses"
              onPress={() =>
                user
                  ? router.push('/account/addresses' as never)
                  : router.push('/auth/login' as never)
              }
            />
            <Row
              label="Wishlist"
              description="Items you saved for later"
              onPress={() =>
                Alert.alert('Wishlist', 'Wishlist is part of a later phase.')
              }
            />
          </View>

          <View style={styles.section}>
            <ThemedText themeColor="textSecondary" style={styles.sectionLabel}>
              SUPPORT
            </ThemedText>
            <Row
              label="Help center"
              onPress={() =>
                Alert.alert('Help', 'External help center link coming soon.')
              }
            />
            <Row
              label="Contact us"
              onPress={() =>
                Alert.alert('Contact', 'Contact details coming soon.')
              }
            />
          </View>

          {user ? (
            <View style={styles.section}>
              <Pressable
                onPress={onLogout}
                style={[
                  styles.logoutBtn,
                  { borderColor: theme.danger, backgroundColor: theme.dangerLight },
                ]}>
                <ThemedText style={[styles.logoutText, { color: theme.danger }]}>
                  Log out
                </ThemedText>
              </Pressable>
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  header: { paddingTop: Spacing.two },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  profileCard: {
    flexDirection: 'row',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: Radius.pill,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { fontSize: 24, fontWeight: '800' },
  profileText: { flex: 1, gap: 4 },
  profileName: { fontSize: 16, fontWeight: '800' },
  profileEmail: { fontSize: 12 },
  verifyChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    marginTop: 2,
  },
  verifyChipText: { fontSize: 10, fontWeight: '800' },
  signInCard: {
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.two,
  },
  signInTitle: { fontSize: 16, fontWeight: '800' },
  signInBody: { fontSize: 13, lineHeight: 18 },
  signInRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  signInBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
  },
  signInBtnGhost: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  signInBtnText: { fontSize: 13, fontWeight: '800' },
  section: { gap: Spacing.one },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    paddingHorizontal: 4,
    marginTop: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.two,
  },
  rowText: { flex: 1, gap: 2 },
  rowLabel: { fontSize: 14, fontWeight: '700' },
  rowDescription: { fontSize: 12 },
  rowTrailing: { fontSize: 16, fontWeight: '600' },
  logoutBtn: {
    paddingVertical: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  logoutText: { fontSize: 14, fontWeight: '800' },
});

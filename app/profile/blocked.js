import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton, Avatar, EmptyState, LoadingView, Screen, ScreenHeader } from '@/components/common';
import { fontSize, radius } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useAuth } from '@/hooks/useAuth';
import { getUser, unblockUser } from '@/services/userService';
import { showError } from '@/store/toastStore';
import { confirmDialog } from '@/lib/dialogs';
import { errorMessage } from '@/lib/utils';

export default function Blocked() {
  const { styles } = useStyles(makeStyles);
  const router = useRouter();
  const { user, profile } = useAuth();
  const ids = profile.blockedUids || [];
  const [users, setUsers] = useState(null);

  useEffect(() => {
    let alive = true;
    Promise.all(ids.map((id) => getUser(id).catch(() => null))).then((list) => {
      if (alive) setUsers(ids.map((id, i) => list[i] || { uid: id, fullName: 'Unknown user' }));
    });
    return () => { alive = false; };
  }, [ids.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  const unblock = async (u) => {
    if (!(await confirmDialog({ title: `Unblock ${u.fullName}?`, confirmText: 'Unblock' }))) return;
    try { await unblockUser(user.uid, u.uid); } catch (e) { showError(errorMessage(e)); }
  };

  return (
    <Screen>
      <ScreenHeader title="Blocked users" onBack={() => router.back()} />
      {users === null && ids.length ? <LoadingView /> : (
        <FlatList
          data={ids.length ? users || [] : []}
          keyExtractor={(u) => u.uid}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          ListEmptyComponent={<View style={{ flex: 1, justifyContent: 'center' }}><EmptyState icon="happy-outline" title="You haven't blocked anyone" /></View>}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Avatar uri={item.profilePicBase64} name={item.fullName} size={44} />
              <Text style={styles.name}>{item.fullName}</Text>
              <AppButton title="Unblock" small variant="outline" onPress={() => unblock(item)} />
            </View>
          )}
        />
      )}
    </Screen>
  );
}
const makeStyles = (c) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, borderRadius: radius.card, borderWidth: 1, borderColor: c.border, padding: 12, marginBottom: 10 },
  name: { flex: 1, marginHorizontal: 12, fontSize: fontSize.md, fontWeight: '700', color: c.text },
});

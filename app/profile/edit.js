import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { updateProfile } from 'firebase/auth';
import { AppButton, AppInput, Avatar, Chip, ErrorBanner, FormScroll, Screen, ScreenHeader } from '@/components/common';
import { CONTACT_METHODS } from '@/constants/campus';
import { fontSize } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebase';
import { pickAvatar } from '@/lib/images';
import { validateName } from '@/lib/validation';
import { errorMessage } from '@/lib/utils';
import { updateMyProfile } from '@/services/userService';
import { showError, showSuccess } from '@/store/toastStore';

const YEARS = ['1st year', '2nd year', '3rd year', '4th year', '5th year'];

export default function EditProfile() {
  const { styles } = useStyles(makeStyles);
  const router = useRouter();
  const { profile, user } = useAuth();
  const [fullName, setFullName] = useState(profile.fullName || '');
  const [department, setDepartment] = useState(profile.department || '');
  const [year, setYear] = useState(profile.year || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [contact, setContact] = useState(profile.contactPreference || 'chat');
  const [photo, setPhoto] = useState(profile.profilePicBase64 || null);
  const [nameError, setNameError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);

  const choosePhoto = async () => {
    try { const b64 = await pickAvatar(); if (b64) setPhoto(b64); } catch (e) { showError(errorMessage(e, 'Could not load that photo.')); }
  };

  const save = async () => {
    const err = validateName(fullName);
    setNameError(err);
    setFormError(null);
    if (err) return;
    setBusy(true);
    try {
      await updateMyProfile(user.uid, {
        fullName: fullName.trim(), department: department.trim(), year, bio: bio.trim(), contactPreference: contact, profilePicBase64: photo,
      });
      if (auth && auth.currentUser) await updateProfile(auth.currentUser, { displayName: fullName.trim() });
      showSuccess('Profile updated');
      router.back();
    } catch (e) { setFormError(errorMessage(e)); } finally { setBusy(false); }
  };

  return (
    <Screen>
      <ScreenHeader title="Edit profile" onBack={() => router.back()} />
      <FormScroll>
        <ErrorBanner message={formError} />
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <TouchableOpacity onPress={choosePhoto} accessibilityLabel="Change profile photo">
            <Avatar uri={photo} name={fullName} size={104} />
          </TouchableOpacity>
          <TouchableOpacity onPress={choosePhoto} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={styles.link}>Change photo</Text></TouchableOpacity>
          {photo ? <TouchableOpacity onPress={() => setPhoto(null)}><Text style={styles.remove}>Remove photo</Text></TouchableOpacity> : null}
        </View>
        <AppInput label="Full name" value={fullName} onChangeText={setFullName} error={nameError} />
        <AppInput label="Campus email" value={profile.email} editable={false} helper="Your campus email can't be changed." />
        <Text style={styles.label}>Year</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
          {YEARS.map((y) => <Chip key={y} label={y} selected={year === y} onPress={() => setYear(year === y ? '' : y)} />)}
        </ScrollView>
        <AppInput label="Department" value={department} onChangeText={setDepartment} placeholder="e.g. Information Technology" />
        <AppInput label="Bio" value={bio} onChangeText={setBio} multiline maxLength={200} placeholder="Tell other students a little about you" />
        <Text style={styles.label}>Contact preference</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 14 }}>
          {CONTACT_METHODS.map((m) => <Chip key={m.key} label={m.label} selected={contact === m.key} onPress={() => setContact(m.key)} />)}
        </View>
        <AppButton title="Save changes" onPress={save} loading={busy} />
      </FormScroll>
    </Screen>
  );
}
const makeStyles = (c) => StyleSheet.create({
  label: { fontSize: fontSize.sm, fontWeight: '600', color: c.text, marginBottom: 6 },
  link: { color: c.primary, fontWeight: '700', fontSize: fontSize.md },
  remove: { color: c.danger, fontSize: fontSize.sm, fontWeight: '600', paddingBottom: 6 },
});

import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

export default function FormScroll({ children, contentStyle }) {
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[{ padding: 20, paddingBottom: 48, width: '100%', maxWidth: 640, alignSelf: 'center' }, contentStyle]}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

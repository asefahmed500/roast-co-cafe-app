'use client';
import React from 'react';
import {
  KeyboardAvoidingView as RNKeyboardAvoidingView,
  Platform,
} from 'react-native';
import type { KeyboardAvoidingViewProps } from 'react-native';

/** Gluestack-style wrapper so screens never import the RN primitive directly. */
const KeyboardAvoidingView = React.forwardRef<
  React.ComponentRef<typeof RNKeyboardAvoidingView>,
  KeyboardAvoidingViewProps
>(function KeyboardAvoidingView({ behavior, ...props }, ref) {
  return (
    <RNKeyboardAvoidingView
      ref={ref}
      behavior={
        behavior ?? Platform.select({ ios: 'padding', android: undefined, web: undefined })
      }
      {...props}
    />
  );
});

KeyboardAvoidingView.displayName = 'KeyboardAvoidingView';

export { KeyboardAvoidingView };

'use client';
import React from 'react';
import { createFormControl } from '@gluestack-ui/core/form-control/creator';
import { UIIcon } from '@gluestack-ui/core/icon/creator';
import { Text, View } from 'react-native';
import { tva } from '@gluestack-ui/utils/nativewind-utils';

const UIFormControl = createFormControl({
  Root: View,
  Error: View,
  ErrorText: Text,
  ErrorIcon: UIIcon,
  Label: View,
  LabelText: Text,
  LabelAstrick: Text,
  Helper: View,
  HelperText: Text,
});

const rootStyle = tva({ base: 'w-full' });
const labelStyle = tva({ base: 'mb-2' });
const labelTextStyle = tva({ base: 'text-[13px] font-bold text-ink' });
const errorStyle = tva({ base: 'flex-row items-center gap-1 mt-1' });
const errorTextStyle = tva({ base: 'text-[12px] text-destructive' });
const errorIconStyle = tva({ base: 'h-3.5 w-3.5 text-destructive' });
const helperStyle = tva({ base: 'mt-1' });
const helperTextStyle = tva({ base: 'text-[12px] text-muted-foreground' });

type AnyProps = Record<string, any> & { className?: string };

const FormControl = React.forwardRef<any, AnyProps>(
  function FormControl({ className, ...props }, ref) {
    return <UIFormControl ref={ref} {...props} className={rootStyle({ class: className })} />;
  }
);

const FormControlLabel = React.forwardRef<any, AnyProps>(
  function FormControlLabel({ className, ...props }, ref) {
    return <UIFormControl.Label ref={ref} {...props} className={labelStyle({ class: className })} />;
  }
);

const FormControlLabelText = React.forwardRef<any, AnyProps>(
  function FormControlLabelText({ className, ...props }, ref) {
    return <UIFormControl.Label.Text ref={ref} {...props} className={labelTextStyle({ class: className })} />;
  }
);

const FormControlError = React.forwardRef<any, AnyProps>(
  function FormControlError({ className, ...props }, ref) {
    return <UIFormControl.Error ref={ref} {...props} className={errorStyle({ class: className })} />;
  }
);

const FormControlErrorText = React.forwardRef<any, AnyProps>(
  function FormControlErrorText({ className, ...props }, ref) {
    return <UIFormControl.Error.Text ref={ref} {...props} className={errorTextStyle({ class: className })} />;
  }
);

const FormControlErrorIcon = React.forwardRef<any, AnyProps>(
  function FormControlErrorIcon({ className, ...props }, ref) {
    return <UIFormControl.Error.Icon ref={ref} {...props} className={errorIconStyle({ class: className })} />;
  }
);

const FormControlHelper = React.forwardRef<any, AnyProps>(
  function FormControlHelper({ className, ...props }, ref) {
    return <UIFormControl.Helper ref={ref} {...props} className={helperStyle({ class: className })} />;
  }
);

const FormControlHelperText = React.forwardRef<any, AnyProps>(
  function FormControlHelperText({ className, ...props }, ref) {
    return <UIFormControl.Helper.Text ref={ref} {...props} className={helperTextStyle({ class: className })} />;
  }
);

export {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText,
};

'use client';
import React from 'react';
import { ActivityIndicator } from 'react-native';
import { tva } from '@gluestack-ui/utils/nativewind-utils';
import { brand } from '@/theme';

const spinnerStyle = tva({
  base: 'text-caramel',
  variants: {
    size: {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
    },
  },
});

type SpinnerProps = Omit<
  React.ComponentPropsWithoutRef<typeof ActivityIndicator>,
  'size'
> & {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | number;
};

const Spinner = React.forwardRef<
  React.ComponentRef<typeof ActivityIndicator>,
  SpinnerProps
>(function Spinner({ className, size = 'md', ...props }, ref) {
  const named = size === 'sm' || size === 'md' || size === 'lg' ? size : undefined;
  const nativeSize = named ? 'large' : (size as number | 'small' | 'large');
  return (
    <ActivityIndicator
      ref={ref}
      size={nativeSize}
      // Native-only color prop; sourced from the theme constant, not a literal.
      color={brand.caramel}
      {...props}
      className={spinnerStyle({ size: named, class: className })}
    />
  );
});

Spinner.displayName = 'Spinner';

export { Spinner };

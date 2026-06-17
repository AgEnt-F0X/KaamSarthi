'use client';

import React from 'react';

type MotionProps = Record<string, unknown> & {
  children?: React.ReactNode;
  className?: string;
};

const motionOnlyProps = new Set([
  'animate',
  'exit',
  'initial',
  'layout',
  'layoutId',
  'transition',
  'variants',
  'whileFocus',
  'whileHover',
  'whileInView',
  'whileTap',
]);

function cleanProps(props: MotionProps) {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (!motionOnlyProps.has(key)) {
      clean[key] = value;
    }
  }
  return clean;
}

function createMotionElement(tag: 'button' | 'circle' | 'div') {
  const Component = React.forwardRef<any, MotionProps>((props, ref) =>
    React.createElement(tag as React.ElementType, { ...cleanProps(props), ref })
  );
  Component.displayName = `motion.${String(tag)}`;
  return Component;
}

export const motion = {
  button: createMotionElement('button'),
  circle: createMotionElement('circle'),
  div: createMotionElement('div'),
};

export function AnimatePresence({
  children,
}: {
  children: React.ReactNode;
  mode?: string;
}) {
  return <>{children}</>;
}

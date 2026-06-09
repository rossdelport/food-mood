import React from 'react';
import { View, Text } from 'react-native';

type SectionProps = {
  title?: string;
  children?: React.ReactNode;
};

// Reusable section wrapper. Placeholder — renders a label and any children.
export default function Section({ title, children }: SectionProps) {
  return (
    <View style={{ padding: 16 }}>
      <Text>Placeholder: Section{title ? ` · ${title}` : ''}</Text>
      {children}
    </View>
  );
}

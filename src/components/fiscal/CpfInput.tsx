import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';

interface CpfInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  error?: string;
}

/**
 * CpfInput component with Brazilian CPF formatting
 * Formats CPF as 000.000.000-00
 */
export default function CpfInput({
  value,
  onChangeText,
  label,
  error,
  ...props
}: CpfInputProps) {
  // Format CPF: 000.000.000-00
  const formatCpf = (text: string): string => {
    // Remove all non-numeric characters
    const cleaned = text.replace(/[^0-9]/g, '');

    // Limit to 11 digits
    const limited = cleaned.slice(0, 11);

    // Format: 000.000.000-00
    if (limited.length <= 3) {
      return limited;
    } else if (limited.length <= 6) {
      return `${limited.slice(0, 3)}.${limited.slice(3)}`;
    } else if (limited.length <= 9) {
      return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6)}`;
    } else {
      return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6, 9)}-${limited.slice(9)}`;
    }
  };

  const handleChangeText = (text: string) => {
    const formatted = formatCpf(text);
    // Remove formatting for storage (backend expects numbers only)
    const cleaned = formatted.replace(/[^0-9]/g, '');
    onChangeText(cleaned);
  };

  const displayValue = value ? formatCpf(value) : '';

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        {...props}
        style={[styles.input, error && styles.inputError]}
        value={displayValue}
        onChangeText={handleChangeText}
        placeholder="000.000.000-00"
        placeholderTextColor="#999"
        keyboardType="numeric"
        maxLength={14}
        editable={props.editable ?? true}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#1a1a1a',
  },
  inputError: {
    borderColor: '#f44336',
  },
  errorText: {
    fontSize: 12,
    color: '#f44336',
    marginTop: 4,
  },
});


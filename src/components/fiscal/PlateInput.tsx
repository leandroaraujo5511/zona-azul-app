import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';

interface PlateInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  error?: string;
}

/**
 * PlateInput component with Brazilian plate formatting
 * Formats plate as ABC1234 or ABC1D23 (Mercosul)
 */
export default function PlateInput({
  value,
  onChangeText,
  label,
  error,
  ...props
}: PlateInputProps) {
  // Format plate: ABC-1234 or ABC-1D23
  const formatPlate = (text: string): string => {
    // Remove all non-alphanumeric characters
    const cleaned = text.toUpperCase().replace(/[^A-Z0-9]/g, '');

    // Limit to 7 characters (old format) or 8 characters (Mercosul)
    const limited = cleaned.slice(0, 8);

    // Format: ABC-1234 or ABC-1D23
    if (limited.length <= 3) {
      return limited;
    } else if (limited.length <= 7) {
      return `${limited.slice(0, 3)}-${limited.slice(3)}`;
    } else {
      // Mercosul format: ABC-1D23
      return `${limited.slice(0, 3)}-${limited.slice(3)}`;
    }
  };

  const handleChangeText = (text: string) => {
    const formatted = formatPlate(text);
    // Remove formatting for storage (backend expects ABC1234)
    const cleaned = formatted.replace(/[^A-Z0-9]/g, '');
    onChangeText(cleaned);
  };

  const displayValue = value ? formatPlate(value) : '';

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        {...props}
        style={[styles.input, error && styles.inputError]}
        value={displayValue}
        onChangeText={handleChangeText}
        placeholder="ABC-1234"
        placeholderTextColor="#999"
        autoCapitalize="characters"
        maxLength={8}
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
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 2,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#1a1a1a',
  },
  inputError: {
    borderColor: '#F44336',
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 4,
  },
});


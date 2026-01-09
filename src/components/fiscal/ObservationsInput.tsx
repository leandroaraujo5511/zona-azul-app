import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';

interface ObservationsInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  error?: string;
  maxLength?: number;
}

export default function ObservationsInput({
  value,
  onChangeText,
  label,
  error,
  maxLength = 500,
  ...props
}: ObservationsInputProps) {
  const remainingChars = maxLength - value.length;

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.charCount}>
            {remainingChars} {remainingChars === 1 ? 'caractere' : 'caracteres'} restante{remainingChars !== 1 ? 's' : ''}
          </Text>
        </View>
      )}
      <TextInput
        {...props}
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder="Ex: Veículo estacionado em frente ao prédio"
        placeholderTextColor="#999"
        multiline
        numberOfLines={4}
        maxLength={maxLength}
        editable={props.editable ?? true}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      <Text style={styles.hint}>Opcional: Adicione observações sobre o estacionamento</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
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
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#f44336',
  },
  errorText: {
    fontSize: 12,
    color: '#f44336',
    marginTop: 4,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});


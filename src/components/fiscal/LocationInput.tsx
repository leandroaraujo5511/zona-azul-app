import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface LocationInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  error?: string;
  onUseGPS?: () => void;
  showGPSButton?: boolean;
}

export default function LocationInput({
  value,
  onChangeText,
  label,
  error,
  onUseGPS,
  showGPSButton = false,
  ...props
}: LocationInputProps) {
  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {showGPSButton && onUseGPS && (
            <TouchableOpacity onPress={onUseGPS} style={styles.gpsButton}>
              <Ionicons name="location" size={16} color="#2196F3" />
              <Text style={styles.gpsButtonText}>Usar GPS</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      <TextInput
        {...props}
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder="Ex: Rua das Flores, 123"
        placeholderTextColor="#999"
        multiline
        numberOfLines={2}
        editable={props.editable ?? true}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      <Text style={styles.hint}>Opcional: Informe a localização do estacionamento</Text>
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
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  gpsButtonText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
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
    minHeight: 60,
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


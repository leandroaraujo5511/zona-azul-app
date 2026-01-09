import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import Ionicons from '@expo/vector-icons/Ionicons';

interface PixCodeDisplayProps {
  pixCode: string;
}

export default function PixCodeDisplay({ pixCode }: PixCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Código PIX (Copia e Cola)</Text>
      <View style={styles.codeContainer}>
        <Text style={styles.codeText} selectable>
          {pixCode}
        </Text>
        <TouchableOpacity
          style={styles.copyButton}
          onPress={handleCopy}
          activeOpacity={0.7}
        >
          {copied ? (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.copyButtonTextCopied}>Copiado!</Text>
            </>
          ) : (
            <>
              <Ionicons name="copy-outline" size={20} color="#2196F3" />
              <Text style={styles.copyButtonText}>Copiar</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      <Text style={styles.hint}>
        Copie o código e cole no app do seu banco para pagar via PIX
      </Text>
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
  codeContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  codeText: {
    flex: 1,
    fontSize: 12,
    color: '#1a1a1a',
    fontFamily: 'monospace',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 6,
  },
  copyButtonText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  copyButtonTextCopied: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    lineHeight: 16,
  },
});


import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';

interface QrCodeDisplayProps {
  qrCodeBase64: string;
  size?: number;
}

export default function QrCodeDisplay({ qrCodeBase64, size = 200 }: QrCodeDisplayProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Debug log
  React.useEffect(() => {
    if (qrCodeBase64) {
      console.log('QR Code received, length:', qrCodeBase64.length);
      console.log('QR Code preview:', qrCodeBase64.substring(0, 100));
    }
  }, [qrCodeBase64]);

  if (!qrCodeBase64 || imageError) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Ionicons name="qr-code-outline" size={size * 0.5} color="#999" />
        <Text style={styles.errorText}>
          {!qrCodeBase64 ? 'QR Code não disponível' : 'Erro ao carregar QR Code'}
        </Text>
      </View>
    );
  }

  // Remove data URI prefix if already present
  const base64Data = qrCodeBase64.startsWith('data:image')
    ? qrCodeBase64.split(',')[1] || qrCodeBase64
    : qrCodeBase64;
  
  // Ensure base64 string is clean (remove any whitespace)
  const cleanBase64 = base64Data.replace(/\s/g, '');
  const imageUri = `data:image/png;base64,${cleanBase64}`;

  return (
    <>
      <TouchableOpacity
        style={styles.qrCodeContainer}
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: imageUri }}
          style={[styles.qrCodeImage, { width: size, height: size }]}
          onError={(error) => {
            console.error('Error loading QR Code image:', error);
            console.error('Image URI:', imageUri.substring(0, 100));
            setImageError(true);
          }}
          contentFit="contain"
          transition={200}
        />
        <View style={styles.zoomHint}>
          <Ionicons name="expand-outline" size={16} color="#2196F3" />
          <Text style={styles.zoomHintText}>Toque para ampliar</Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>QR Code PIX</Text>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#1a1a1a" />
              </TouchableOpacity>
            </View>
            <Image
              source={{ uri: imageUri }}
              style={styles.modalQrCode}
              contentFit="contain"
              transition={200}
              onError={(error) => {
                console.error('Error loading QR Code image in modal:', error);
                setImageError(true);
              }}
            />
            <Text style={styles.modalHint}>Escaneie o QR Code com seu app de pagamento</Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  qrCodeContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  qrCodeImage: {
    borderRadius: 8,
  },
  zoomHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  zoomHintText: {
    fontSize: 12,
    color: '#2196F3',
  },
  errorText: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  closeButton: {
    padding: 4,
  },
  modalQrCode: {
    width: 300,
    height: 300,
    marginBottom: 16,
  },
  modalHint: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});


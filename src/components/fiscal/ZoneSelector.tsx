import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Zone } from '../../types/api';

interface ZoneSelectorProps {
  zones: Zone[];
  selectedZone: Zone | null;
  onSelect: (zone: Zone) => void;
  isLoading?: boolean;
}

export default function ZoneSelector({
  zones,
  selectedZone,
  onSelect,
  isLoading = false,
}: ZoneSelectorProps) {
  const [modalVisible, setModalVisible] = React.useState(false);

  const handleSelect = (zone: Zone) => {
    onSelect(zone);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Zona *</Text>
      <TouchableOpacity
        style={[styles.selector, isLoading && styles.selectorDisabled]}
        onPress={() => !isLoading && setModalVisible(true)}
        disabled={isLoading}
      >
        <Text style={[styles.selectorText, !selectedZone && styles.selectorPlaceholder]}>
          {selectedZone ? `${selectedZone.code} - ${selectedZone.name}` : 'Selecione uma zona'}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione uma Zona</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#1a1a1a" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={zones}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.zoneItem,
                    selectedZone?.id === item.id && styles.zoneItemSelected,
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <View style={styles.zoneInfo}>
                    <Text style={styles.zoneCode}>{item.code}</Text>
                    <Text style={styles.zoneName}>{item.name}</Text>
                    <Text style={styles.zoneAddress}>{item.address}</Text>
                  </View>
                  {selectedZone?.id === item.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Nenhuma zona disponível</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
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
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectorDisabled: {
    opacity: 0.6,
  },
  selectorText: {
    fontSize: 16,
    color: '#1a1a1a',
    flex: 1,
  },
  selectorPlaceholder: {
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  zoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  zoneItemSelected: {
    backgroundColor: '#F5F5F5',
  },
  zoneInfo: {
    flex: 1,
  },
  zoneCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  zoneName: {
    fontSize: 14,
    color: '#1a1a1a',
    marginBottom: 2,
  },
  zoneAddress: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
});


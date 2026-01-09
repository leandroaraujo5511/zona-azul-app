import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export type PeriodOption = 'today' | 'week' | 'month' | 'custom';

interface PeriodFilterProps {
  selectedPeriod: PeriodOption;
  onSelectPeriod: (period: PeriodOption) => void;
  dateFrom?: Date;
  dateTo?: Date;
  showLabel?: boolean;
  onCustomDateChange?: (from: Date | undefined, to: Date | undefined) => void;
}

export default function PeriodFilter({
  selectedPeriod,
  onSelectPeriod,
  dateFrom,
  dateTo,
  showLabel = true,
  onCustomDateChange,
}: PeriodFilterProps) {
  const getPeriodLabel = (period: PeriodOption): string => {
    switch (period) {
      case 'today':
        return 'Hoje';
      case 'week':
        return 'Última Semana';
      case 'month':
        return 'Último Mês';
      case 'custom':
        if (dateFrom && dateTo) {
          const formatDate = (date: Date) => {
            return new Intl.DateTimeFormat('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }).format(date);
          };
          return `${formatDate(dateFrom)} - ${formatDate(dateTo)}`;
        }
        return 'Período Customizado';
      default:
        return 'Todos';
    }
  };

  const handleSelectPeriod = (period: PeriodOption) => {
    onSelectPeriod(period);
  };

  return (
    <>
      {showLabel && (
      <View style={styles.container}>
        <Text style={styles.label}>Período:</Text>
        <TouchableOpacity style={styles.button} onPress={() => {}}>
          <Ionicons name="calendar-outline" size={18} color="#2196F3" />
          <Text style={styles.buttonText}>{getPeriodLabel(selectedPeriod)}</Text>
          <Ionicons name="chevron-down" size={18} color="#666" />
        </TouchableOpacity>
      </View>
      )}
      <View style={styles.optionsContainer}>
        {(['today', 'week', 'month'] as PeriodOption[]).map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.optionButton,
              selectedPeriod === period && styles.optionButtonActive,
            ]}
            onPress={() => handleSelectPeriod(period)}
          >
            <Text
              style={[
                styles.optionText,
                selectedPeriod === period && styles.optionTextActive,
              ]}
            >
              {getPeriodLabel(period)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Custom date picker modal - Simplified for now */}
      {selectedPeriod === 'custom' && (
        <View style={styles.customPeriodNote}>
          <Ionicons name="information-circle-outline" size={16} color="#666" />
          <Text style={styles.customPeriodText}>
            Selecione um período padrão ou use o filtro de período no backend
          </Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginRight: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    gap: 8,
  },
  buttonText: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  optionButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  optionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  optionTextActive: {
    color: '#fff',
  },
  customPeriodNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  customPeriodText: {
    flex: 1,
    fontSize: 12,
    color: '#856404',
  },
});


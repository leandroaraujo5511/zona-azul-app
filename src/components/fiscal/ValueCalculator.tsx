import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ValueCalculatorProps {
  requestedMinutes: number;
  periodMinutes: number;
  pricePerPeriod: number;
}

export default function ValueCalculator({
  requestedMinutes,
  periodMinutes,
  pricePerPeriod,
}: ValueCalculatorProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Calculate number of periods needed
  const periods = Math.ceil(requestedMinutes / periodMinutes);
  const totalValue = periods * pricePerPeriod;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cálculo do Valor</Text>

      <View style={styles.calculationRow}>
        <Text style={styles.calculationLabel}>Tempo solicitado:</Text>
        <Text style={styles.calculationValue}>{requestedMinutes} minutos</Text>
      </View>

      <View style={styles.calculationRow}>
        <Text style={styles.calculationLabel}>Período da zona:</Text>
        <Text style={styles.calculationValue}>{periodMinutes} minutos</Text>
      </View>

      <View style={styles.calculationRow}>
        <Text style={styles.calculationLabel}>Períodos necessários:</Text>
        <Text style={styles.calculationValue}>{periods} período(s)</Text>
      </View>

      <View style={styles.calculationRow}>
        <Text style={styles.calculationLabel}>Preço por período:</Text>
        <Text style={styles.calculationValue}>{formatCurrency(pricePerPeriod)}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Valor Total:</Text>
        <Text style={styles.totalValue}>{formatCurrency(totalValue)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  calculationLabel: {
    fontSize: 14,
    color: '#666',
  },
  calculationValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
});


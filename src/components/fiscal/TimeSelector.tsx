import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface TimeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  minMinutes?: number;
  maxMinutes?: number;
  periodMinutes?: number;
}

// Format time label
const formatTimeLabel = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${minutes} min`;
  } else if (mins === 0) {
    return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  } else {
    return `${hours}h ${mins}min`;
  }
};

// Generate time options based on zone limits
const generateTimeOptions = (
  minMinutes: number,
  maxMinutes: number,
  periodMinutes: number
): Array<{ label: string; value: string }> => {
  const options: Array<{ label: string; value: string }> = [];
  
  // Always include minimum time
  options.push({ label: formatTimeLabel(minMinutes), value: minMinutes.toString() });

  // Calculate how many periods fit in the max time
  const maxPeriods = Math.floor(maxMinutes / periodMinutes);
  const minPeriods = Math.ceil(minMinutes / periodMinutes);
  
  // Generate options: start from 1 period, then multiples
  // Try to get around 6-8 options total (excluding min and max)
  const targetOptions = 6;
  const availablePeriods = maxPeriods - minPeriods;
  
  if (availablePeriods > 0) {
    const step = Math.max(1, Math.floor(availablePeriods / targetOptions));
    
    for (let periods = minPeriods + step; periods < maxPeriods; periods += step) {
      const minutes = periods * periodMinutes;
      if (minutes > minMinutes && minutes < maxMinutes) {
        options.push({ label: formatTimeLabel(minutes), value: minutes.toString() });
      }
      // Stop if we have enough options
      if (options.length >= targetOptions) break;
    }
  }
  
  // If we don't have enough options, add some common intervals
  if (options.length < 3 && maxMinutes > minMinutes) {
    const commonIntervals = [
      minMinutes + periodMinutes,
      Math.floor((minMinutes + maxMinutes) / 2),
      maxMinutes - periodMinutes,
    ];
    
    for (const minutes of commonIntervals) {
      if (minutes > minMinutes && minutes < maxMinutes) {
        const roundedMinutes = Math.floor(minutes / periodMinutes) * periodMinutes;
        if (roundedMinutes > minMinutes && roundedMinutes < maxMinutes) {
          const exists = options.some((opt) => opt.value === roundedMinutes.toString());
          if (!exists) {
            options.push({ label: formatTimeLabel(roundedMinutes), value: roundedMinutes.toString() });
          }
        }
      }
    }
  }

  // Always include maximum if not already included
  const lastOption = options[options.length - 1];
  if (!lastOption || parseInt(lastOption.value, 10) !== maxMinutes) {
    options.push({ label: formatTimeLabel(maxMinutes), value: maxMinutes.toString() });
  }

  // Remove duplicates and sort
  const uniqueOptions = Array.from(
    new Map(options.map((opt) => [opt.value, opt])).values()
  ).sort((a, b) => parseInt(a.value, 10) - parseInt(b.value, 10));

  return uniqueOptions;
};

export default function TimeSelector({
  value,
  onChange,
  disabled = false,
  minMinutes = 15,
  maxMinutes = 480,
  periodMinutes = 15,
}: TimeSelectorProps) {
  const timeOptions = React.useMemo(
    () => generateTimeOptions(minMinutes, maxMinutes, periodMinutes),
    [minMinutes, maxMinutes, periodMinutes]
  );
  const [showCustomInput, setShowCustomInput] = React.useState(false);
  const [customValue, setCustomValue] = React.useState('');

  const handleSelectOption = (optionValue: string) => {
    onChange(optionValue);
    setShowCustomInput(false);
  };

  const handleCustomInput = () => {
    setShowCustomInput(true);
    setCustomValue(value);
  };

  const handleCustomSubmit = () => {
    const minutes = parseInt(customValue, 10);
    if (!isNaN(minutes) && minutes >= minMinutes && minutes <= maxMinutes) {
      onChange(customValue);
      setShowCustomInput(false);
    } else {
      // Show error if invalid
      return;
    }
  };

  const isOptionSelected = (optionValue: string) => value === optionValue;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tempo (minutos) *</Text>

      {!showCustomInput ? (
        <>
          <View style={styles.optionsGrid}>
            {timeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.timeCard,
                  isOptionSelected(option.value) && styles.timeCardSelected,
                  disabled && styles.timeCardDisabled,
                ]}
                onPress={() => !disabled && handleSelectOption(option.value)}
                disabled={disabled}
              >
                <Text
                  style={[
                    styles.timeCardText,
                    isOptionSelected(option.value) && styles.timeCardTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {isOptionSelected(option.value) && (
                  <Ionicons name="checkmark-circle" size={20} color="#2196F3" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.customButton}
            onPress={handleCustomInput}
            disabled={disabled}
          >
            <Ionicons name="create-outline" size={18} color="#2196F3" />
            <Text style={styles.customButtonText}>
              {value && !timeOptions.find((opt) => opt.value === value)
                ? `Personalizado: ${value} min`
                : 'Tempo personalizado'}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.customInputContainer}>
          <TextInput
            style={styles.customInput}
            placeholder={`Digite os minutos (${minMinutes}-${maxMinutes})`}
            placeholderTextColor="#999"
            value={customValue}
            onChangeText={setCustomValue}
            keyboardType="numeric"
            maxLength={3}
            autoFocus
            editable={!disabled}
          />
          <View style={styles.customInputActions}>
            <TouchableOpacity
              style={styles.customInputButton}
              onPress={() => {
                setShowCustomInput(false);
                setCustomValue('');
              }}
            >
              <Text style={styles.customInputButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.customInputButton, styles.customInputButtonPrimary]}
              onPress={handleCustomSubmit}
            >
              <Text style={[styles.customInputButtonText, styles.customInputButtonTextPrimary]}>
                Confirmar
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.hint}>
            Mínimo: {minMinutes} minutos | Máximo: {maxMinutes} minutos
          </Text>
        </View>
      )}
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
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  timeCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  timeCardSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  timeCardDisabled: {
    opacity: 0.6,
  },
  timeCardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  timeCardTextSelected: {
    color: '#2196F3',
  },
  customButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2196F3',
    borderStyle: 'dashed',
  },
  customButtonText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  customInputContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  customInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  customInputActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  customInputButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  customInputButtonPrimary: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  customInputButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  customInputButtonTextPrimary: {
    color: '#fff',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});


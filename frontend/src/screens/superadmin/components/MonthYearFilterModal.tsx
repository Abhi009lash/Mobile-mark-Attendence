import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { monthYearFilterModalStyles as styles } from '../styles/monthYearFilterModal.styles';

interface MonthYearFilterModalProps {
  visible: boolean;
  selectedYear: number;
  selectedMonth: number;
  availableYears: number[];
  getAvailableMonths: (year: number) => { value: number; label: string }[];
  onApply: (year: number, month: number) => void;
  onClose: () => void;
}

export const MonthYearFilterModal: React.FC<MonthYearFilterModalProps> = ({
  visible,
  selectedYear,
  selectedMonth,
  availableYears,
  getAvailableMonths,
  onApply,
  onClose,
}) => {
  const [tempYear, setTempYear] = useState<number>(selectedYear);
  const [tempMonth, setTempMonth] = useState<number>(selectedMonth);

  useEffect(() => {
    setTempYear(selectedYear);
    setTempMonth(selectedMonth);
  }, [selectedYear, selectedMonth, visible]);

  const availableMonths = getAvailableMonths(tempYear);

  const handleYearSelect = (year: number) => {
    setTempYear(year);
    const validMonths = getAvailableMonths(year);
    if (!validMonths.some((m) => m.value === tempMonth)) {
      setTempMonth(validMonths[validMonths.length - 1]?.value || 1);
    }
  };

  const handleApply = () => {
    onApply(tempYear, tempMonth);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <View style={styles.header}>
                <View>
                  <Text style={styles.title}>Filter Period</Text>
                  <Text style={styles.subtitle}>Select past or current timeline</Text>
                </View>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionLabel}>YEAR</Text>
                <View style={styles.pillsRow}>
                  {availableYears.map((yr) => {
                    const isSelected = yr === tempYear;
                    return (
                      <TouchableOpacity
                        key={yr}
                        style={[styles.yearPill, isSelected && styles.yearPillSelected]}
                        onPress={() => handleYearSelect(yr)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.yearPillText, isSelected && styles.yearPillTextSelected]}>
                          {yr}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={[styles.sectionLabel, { marginTop: 20 }]}>MONTH (PAST ONLY)</Text>
                <View style={styles.monthsGrid}>
                  {availableMonths.map((m) => {
                    const isSelected = m.value === tempMonth;
                    return (
                      <TouchableOpacity
                        key={m.value}
                        style={[styles.monthPill, isSelected && styles.monthPillSelected]}
                        onPress={() => setTempMonth(m.value)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.monthPillText, isSelected && styles.monthPillTextSelected]}>
                          {m.label.substring(0, 3)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              <View style={styles.footer}>
                <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.8}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.applyBtn} onPress={handleApply} activeOpacity={0.8}>
                  <Text style={styles.applyBtnText}>Apply Filter</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

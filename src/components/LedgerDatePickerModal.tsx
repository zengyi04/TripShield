import React, { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getMonthGrid, monthLabel, todayStr } from '../utils/ledgerCalculations';
import { ledgerStyles as s } from '../utils/ledgerTheme';

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function LedgerDatePickerModal({
  visible,
  initialDate,
  minDate,
  onSelect,
  onClose,
}: {
  visible: boolean;
  initialDate: string;
  minDate?: string;
  onSelect: (date: string) => void;
  onClose: () => void;
}) {
  const [y, m] = initialDate.split('-').map(Number);
  const [viewYear, setViewYear] = useState(y || new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState((m || 1) - 1);
  const today = todayStr();

  if (!visible) return null;

  function goToMonth(delta: number) {
    let nextMonth = viewMonth + delta;
    let nextYear = viewYear;
    if (nextMonth < 0) {
      nextMonth = 11;
      nextYear -= 1;
    } else if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }
    setViewMonth(nextMonth);
    setViewYear(nextYear);
  }

  const grid = getMonthGrid(viewYear, viewMonth);

  return (
    <Modal visible transparent animationType="slide">
      <Pressable style={s.modalBackdrop} onPress={onClose}>
        <Pressable style={s.modalSheet} onPress={() => undefined}>
          <Text style={s.modalTitle}>Select Date</Text>
          <View style={s.calendarHeaderRow}>
            <Pressable onPress={() => goToMonth(-1)} style={({ pressed }) => [s.calendarNavButton, pressed && { opacity: 0.7 }]}>
              <Ionicons name="chevron-back" size={16} color="#2563eb" />
            </Pressable>
            <Text style={s.calendarMonthLabel}>{monthLabel(viewYear, viewMonth)}</Text>
            <Pressable onPress={() => goToMonth(1)} style={({ pressed }) => [s.calendarNavButton, pressed && { opacity: 0.7 }]}>
              <Ionicons name="chevron-forward" size={16} color="#2563eb" />
            </Pressable>
          </View>

          <View style={s.calendarWeekRow}>
            {WEEKDAY_LABELS.map((label, idx) => (
              <View key={idx} style={s.calendarWeekDayCell}>
                <Text style={s.calendarWeekDayText}>{label}</Text>
              </View>
            ))}
          </View>

          {grid.map((week, rowIdx) => (
            <View key={rowIdx} style={s.calendarDayRow}>
              {week.map((date, colIdx) => {
                if (!date) return <View key={colIdx} style={s.calendarDayCell} />;
                const day = Number(date.split('-')[2]);
                const isSelected = date === initialDate;
                const isToday = date === today;
                const isDisabled = !!minDate && date < minDate;
                return (
                  <Pressable
                    key={colIdx}
                    disabled={isDisabled}
                    onPress={() => {
                      onSelect(date);
                      onClose();
                    }}
                    style={s.calendarDayCell}
                  >
                    <View style={[s.calendarDayCircle, isSelected && s.calendarDaySelected, !isSelected && isToday && s.calendarDayToday]}>
                      <Text style={[s.calendarDayText, isSelected && s.calendarDayTextSelected, isDisabled && { color: 'rgba(15,23,42,0.25)' }]}>{day}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

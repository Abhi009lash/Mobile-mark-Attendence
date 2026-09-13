import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { OrgStatusStats } from '../../../api/dashboard';
import { donutStatusChartStyles as styles } from '../styles/donutStatusChart.styles';

interface DonutStatusChartProps {
  statusStats: OrgStatusStats;
}

export const DonutStatusChart: React.FC<DonutStatusChartProps> = ({ statusStats }) => {
  const { active, trial, suspended, total } = statusStats;

  const size = 160;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const safeTotal = total > 0 ? total : 1;
  const activeRatio = active / safeTotal;
  const trialRatio = trial / safeTotal;
  const suspendedRatio = suspended / safeTotal;

  const activeStroke = activeRatio * circumference;
  const trialStroke = trialRatio * circumference;
  const suspendedStroke = suspendedRatio * circumference;

  const activePct = total > 0 ? Math.round(activeRatio * 100) : 0;
  const trialPct = total > 0 ? Math.round(trialRatio * 100) : 0;
  const suspendedPct = total > 0 ? Math.round(suspendedRatio * 100) : 0;

  const activeOffset = 0;
  const trialOffset = -activeStroke;
  const suspendedOffset = -(activeStroke + trialStroke);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Account Distribution</Text>
        <Text style={styles.subtitle}>By Operational Status</Text>
      </View>

      <View style={styles.contentRow}>
        <View style={styles.chartWrapper}>
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#F1F5F9"
                strokeWidth={strokeWidth}
                fill="transparent"
              />

              {active > 0 && (
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="#10B981"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${activeStroke} ${circumference}`}
                  strokeDashoffset={activeOffset}
                  fill="transparent"
                />
              )}

              {trial > 0 && (
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="#F59E0B"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${trialStroke} ${circumference}`}
                  strokeDashoffset={trialOffset}
                  fill="transparent"
                />
              )}

              {suspended > 0 && (
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="#EF4444"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${suspendedStroke} ${circumference}`}
                  strokeDashoffset={suspendedOffset}
                  fill="transparent"
                />
              )}
            </G>
          </Svg>

          <View style={styles.centerTextContainer}>
            <Text style={styles.centerNumber}>{total}</Text>
            <Text style={styles.centerLabel}>Total</Text>
          </View>
        </View>

        <View style={styles.legendContainer}>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <View style={styles.legendTextWrapper}>
              <Text style={styles.legendTitle}>Active</Text>
              <Text style={styles.legendValue}>
                {active} <Text style={styles.legendPct}>({activePct}%)</Text>
              </Text>
            </View>
          </View>

          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
            <View style={styles.legendTextWrapper}>
              <Text style={styles.legendTitle}>Trial</Text>
              <Text style={styles.legendValue}>
                {trial} <Text style={styles.legendPct}>({trialPct}%)</Text>
              </Text>
            </View>
          </View>

          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
            <View style={styles.legendTextWrapper}>
              <Text style={styles.legendTitle}>Suspended</Text>
              <Text style={styles.legendValue}>
                {suspended} <Text style={styles.legendPct}>({suspendedPct}%)</Text>
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

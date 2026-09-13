import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Path, Circle, Line } from 'react-native-svg';
import { DailyTrendPoint } from '../../../api/dashboard';
import { ChartDataType } from '../hooks/useDashboardStats';
import { areaTrendChartStyles as styles } from '../styles/areaTrendChart.styles';

interface AreaTrendChartProps {
  data: DailyTrendPoint[];
  activeTab: ChartDataType;
  onTabChange: (tab: ChartDataType) => void;
}

export const AreaTrendChart: React.FC<AreaTrendChartProps> = ({
  data,
  activeTab,
  onTabChange,
}) => {
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);

  const values = data.map((d) => (activeTab === 'organizations' ? d.organizations : d.employees));
  const maxVal = Math.max(...values, 5);

  const chartWidth = 500;
  const chartHeight = 180;
  const paddingLeft = 35;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const points = data.map((d, index) => {
    const val = activeTab === 'organizations' ? d.organizations : d.employees;
    const x = paddingLeft + (data.length > 1 ? (index / (data.length - 1)) * innerWidth : innerWidth / 2);
    const y = paddingTop + innerHeight - (val / maxVal) * innerHeight;
    return { x, y, val, label: d.day_label, day: d.day };
  });

  let linePath = '';
  let areaPath = '';

  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx = (p0.x + p1.x) / 2;
      linePath += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const baseY = paddingTop + innerHeight;
    areaPath = `${linePath} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
  }

  const isOrg = activeTab === 'organizations';
  const strokeColor = isOrg ? '#2563EB' : '#059669';
  const gradStartColor = isOrg ? '#93C5FD' : '#6EE7B7';
  const gradStopColor = isOrg ? '#DBEAFE' : '#D1FAE5';

  const selectedPoint = selectedPointIndex !== null ? points[selectedPointIndex] : points[points.length - 1];

  // Decide label sampling step to prevent overflow on mobile screens
  const labelStep = data.length > 15 ? 5 : data.length > 8 ? 2 : 1;

  return (
    <View style={styles.container}>
      {/* Header with Title and Tab Switcher */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Daily Velocity</Text>
          <Text style={styles.subtitle}>
            {selectedPoint
              ? `${selectedPoint.label}: ${selectedPoint.val} ${isOrg ? 'Organizations' : 'Licensed Seats'}`
              : 'Day-Wise Growth Trend'}
          </Text>
        </View>

        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[styles.tabBtn, isOrg && styles.tabBtnActive]}
            onPress={() => {
              onTabChange('organizations');
              setSelectedPointIndex(null);
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabBtnText, isOrg && styles.tabBtnTextActive]}>Organizations</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, !isOrg && styles.tabBtnActive]}
            onPress={() => {
              onTabChange('employees');
              setSelectedPointIndex(null);
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabBtnText, !isOrg && styles.tabBtnTextActive]}>Employees</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* SVG Day-Wise Area Chart */}
      <View style={styles.chartWrapper}>
        <Svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={styles.svg}>
          <Defs>
            <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={gradStartColor} stopOpacity="0.45" />
              <Stop offset="100%" stopColor={gradStopColor} stopOpacity="0.04" />
            </LinearGradient>
          </Defs>

          {/* Gridlines */}
          {[0, 0.5, 1].map((ratio, i) => {
            const y = paddingTop + innerHeight * (1 - ratio);
            return (
              <Line
                key={i}
                x1={paddingLeft}
                y1={y}
                x2={chartWidth - paddingRight}
                y2={y}
                stroke="#E2E8F0"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            );
          })}

          {/* Area Fill */}
          {areaPath ? <Path d={areaPath} fill="url(#areaGradient)" /> : null}

          {/* Line Stroke */}
          {linePath ? (
            <Path d={linePath} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
          ) : null}

          {/* Data Points */}
          {points.map((p, idx) => {
            const isSelected = idx === (selectedPointIndex ?? points.length - 1);
            return (
              <Circle
                key={idx}
                cx={p.x}
                cy={p.y}
                r={isSelected ? 5 : 3.5}
                fill="#FFFFFF"
                stroke={strokeColor}
                strokeWidth={isSelected ? 2.5 : 1.8}
                onPress={() => setSelectedPointIndex(idx)}
              />
            );
          })}
        </Svg>
      </View>

      {/* X-Axis Day Labels */}
      <View style={styles.labelsRow}>
        {data.map((d, index) => {
          const isSelected = index === (selectedPointIndex ?? points.length - 1);
          const isMilestone = index === 0 || index === data.length - 1 || d.day % labelStep === 0;

          if (!isMilestone && !isSelected) return null;

          return (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedPointIndex(index)}
              style={styles.labelBtn}
            >
              <Text style={[styles.labelText, isSelected && styles.labelTextActive]}>
                Day {d.day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

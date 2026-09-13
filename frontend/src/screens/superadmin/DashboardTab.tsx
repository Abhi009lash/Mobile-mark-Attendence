import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDashboardStats } from './hooks/useDashboardStats';
import { DashboardKpiCard } from './components/DashboardKpiCard';
import { AreaTrendChart } from './components/AreaTrendChart';
import { DonutStatusChart } from './components/DonutStatusChart';
import { MonthYearFilterModal } from './components/MonthYearFilterModal';
import { DashboardSkeleton } from './components/DashboardSkeleton';
import { dashboardStyles as styles } from './styles/dashboardStyles';

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface DashboardTabProps {
  onNavigateTab?: (tab: string) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ onNavigateTab }) => {
  const {
    selectedYear,
    selectedMonth,
    setSelectedYear,
    setSelectedMonth,
    activeChartTab,
    setActiveChartTab,
    data,
    loading,
    refreshing,
    error,
    refresh,
    availableYears,
    getAvailableMonths,
  } = useDashboardStats();

  const [filterModalVisible, setFilterModalVisible] = useState<boolean>(false);

  const filterLabel = `${MONTH_SHORT[selectedMonth - 1] || ''} ${selectedYear}`;

  const handleApplyFilter = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      >
        <View style={styles.contentWrapper}>
          {/* Header Row with Filter Button */}
          <View style={styles.headerRow}>
            <Text style={styles.title}>Dashboard</Text>

            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setFilterModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="calendar-outline" size={16} color="#1657DE" />
              <Text style={styles.filterButtonText}>{filterLabel}</Text>
              <Ionicons name="chevron-down" size={14} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Loading Skeleton UI */}
          {loading && !refreshing ? (
            <DashboardSkeleton />
          ) : (
            data && (
              <>
                {/* 1. KPI Cards Row */}
                <View style={styles.kpiRow}>
                  <DashboardKpiCard
                    title="Total Organization"
                    value={data.kpis.total_organizations}
                    iconName="business-outline"
                    iconColor="#2563EB"
                    iconBg="#EFF6FF"
                    subText="Fleet"
                  />
                  <DashboardKpiCard
                    title="Total Admin"
                    value={data.kpis.total_admins}
                    iconName="shield-checkmark-outline"
                    iconColor="#7C3AED"
                    iconBg="#F5F3FF"
                    subText="Seats"
                  />
                  <DashboardKpiCard
                    title="Total Employees"
                    value={data.kpis.total_employees}
                    iconName="people-outline"
                    iconColor="#059669"
                    iconBg="#ECFDF5"
                    subText="Field"
                  />
                </View>

                {/* 2. Day-Wise Area Trend Graph with Tab Switcher */}
                <AreaTrendChart
                  data={data.daily_trends}
                  activeTab={activeChartTab}
                  onTabChange={setActiveChartTab}
                />

                {/* 3. Donut Chart for Organization Status (Active, Trial, Suspended) */}
                <DonutStatusChart statusStats={data.organization_status} />
              </>
            )
          )}
        </View>
      </ScrollView>

      {/* Month & Year Filter Modal (Past periods only) */}
      <MonthYearFilterModal
        visible={filterModalVisible}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        availableYears={availableYears}
        getAvailableMonths={getAvailableMonths}
        onApply={handleApplyFilter}
        onClose={() => setFilterModalVisible(false)}
      />
    </View>
  );
};

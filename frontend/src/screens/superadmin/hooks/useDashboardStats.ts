import { useState, useEffect, useCallback } from 'react';
import { dashboardApi, DashboardMetricsResponse } from '../../../api/dashboard';

export type ChartDataType = 'organizations' | 'employees';

export const useDashboardStats = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // 1-12

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [activeChartTab, setActiveChartTab] = useState<ChartDataType>('organizations');

  const [data, setData] = useState<DashboardMetricsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const response = await dashboardApi.getMetrics(selectedYear, selectedMonth);
        setData(response);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch dashboard metrics');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedYear, selectedMonth]
  );

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Only previous/current years (e.g., starting 2 years back up to current year)
  const availableYears = [currentYear - 2, currentYear - 1, currentYear];

  // Only previous/current months for the selected year
  const getAvailableMonths = (year: number) => {
    const maxMonth = year === currentYear ? currentMonth : 12;
    const allMonths = [
      { value: 1, label: 'January' },
      { value: 2, label: 'February' },
      { value: 3, label: 'March' },
      { value: 4, label: 'April' },
      { value: 5, label: 'May' },
      { value: 6, label: 'June' },
      { value: 7, label: 'July' },
      { value: 8, label: 'August' },
      { value: 9, label: 'September' },
      { value: 10, label: 'October' },
      { value: 11, label: 'November' },
      { value: 12, label: 'December' },
    ];
    return allMonths.filter((m) => m.value <= maxMonth);
  };

  const handleYearChange = (newYear: number) => {
    setSelectedYear(newYear);
    // If switching to current year and previously selected month is in the future, clamp it
    if (newYear === currentYear && selectedMonth > currentMonth) {
      setSelectedMonth(currentMonth);
    }
  };

  return {
    selectedYear,
    selectedMonth,
    setSelectedYear: handleYearChange,
    setSelectedMonth,
    activeChartTab,
    setActiveChartTab,
    data,
    loading,
    refreshing,
    error,
    refresh: () => fetchStats(true),
    currentYear,
    currentMonth,
    availableYears,
    getAvailableMonths,
  };
};

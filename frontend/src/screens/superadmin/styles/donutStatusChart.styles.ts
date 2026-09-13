import { StyleSheet } from 'react-native';

export const donutStatusChartStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 6,
  },
  chartWrapper: {
    width: 160,
    height: 160,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  centerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: -2,
  },
  legendContainer: {
    gap: 14,
    minWidth: 130,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendTextWrapper: {
    flex: 1,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  legendValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  legendPct: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
  },
});

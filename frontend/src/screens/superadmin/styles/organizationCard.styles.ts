import { StyleSheet } from 'react-native';

export const organizationCardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  cardOrgLogo: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardLogoFallback: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLogoInitials: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1657DE',
  },
  orgName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codePill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  codeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  orgWebsite: {
    fontSize: 12,
    color: '#1657DE',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusActive: {
    backgroundColor: '#DCFCE7',
  },
  statusTrial: {
    backgroundColor: '#FEF9C3',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  activeTxt: {
    color: '#16A34A',
  },
  trialTxt: {
    color: '#CA8A04',
  },
  cardAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardAddressText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
  },
  quotasRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 6,
    alignItems: 'center',
  },
  quotaBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    borderRadius: 8,
  },
  quotaLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quotaLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  quotaVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  quotaDivider: {
    width: 1,
    height: 22,
    backgroundColor: '#E2E8F0',
  },
});

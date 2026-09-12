import { useState, useEffect, useCallback, useRef } from 'react';
import { ScrollView } from 'react-native';
import { organizationsApi, OrganizationItem, ApiError } from '../../../api/organizations';
import { toast } from '../../../components/common/Toast';

export const useOrganizations = (scrollViewRef: React.RefObject<ScrollView | null>) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalCount, setTotalCount] = useState(0);
  const [isFetchingPage, setIsFetchingPage] = useState(false);
  const isFirstLoadRef = useRef(true);

  const [orgs, setOrgs] = useState<OrganizationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<string, boolean>>({});

  const [orgToDelete, setOrgToDelete] = useState<OrganizationItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [orgToEditLimits, setOrgToEditLimits] = useState<OrganizationItem | null>(null);
  const [initialLimitsField, setInitialLimitsField] = useState<'admins' | 'employees'>('admins');
  const [orgToEdit, setOrgToEdit] = useState<OrganizationItem | null>(null);
  const clickTimerRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    return () => {
      Object.values(clickTimerRef.current).forEach((t) => clearTimeout(t));
    };
  }, []);

  const handleOpenEditLimits = (org: OrganizationItem, field: 'admins' | 'employees' = 'admins') => {
    setInitialLimitsField(field);
    setOrgToEditLimits(org);
  };

  const handleUpdateLimitsSuccess = (updatedOrg: OrganizationItem) => {
    setOrgs((prev) => prev.map((o) => (o.id === updatedOrg.id ? updatedOrg : o)));
    setOrgToEditLimits(null);
  };

  const handleUpdateOrgSuccess = (updatedOrg: OrganizationItem) => {
    setOrgs((prev) => prev.map((o) => (o.id === updatedOrg.id ? updatedOrg : o)));
    setOrgToEdit(null);
  };

  const handleCardPress = (org: OrganizationItem) => {
    const existingTimer = clickTimerRef.current[org.id];
    if (existingTimer) {
      clearTimeout(existingTimer);
      delete clickTimerRef.current[org.id];
      setOrgToDelete(org);
      setDeleteError(null);
    } else {
      clickTimerRef.current[org.id] = setTimeout(() => {
        delete clickTimerRef.current[org.id];
        setOrgToEdit(org);
      }, 260);
    }
  };

  const fetchOrganizations = useCallback(
    async (
      targetPage: number,
      targetSize: number,
      targetSearch: string,
      isRefresh = false
    ) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else if (isFirstLoadRef.current) {
          setLoading(true);
        } else {
          setIsFetchingPage(true);
        }

        const data = await organizationsApi.list({
          page: targetPage,
          page_size: targetSize,
          search: targetSearch.trim() || undefined,
        });

        setOrgs(data.items || []);
        setTotalCount(data.total ?? 0);
      } catch {
        // Backend offline fallback
      } finally {
        isFirstLoadRef.current = false;
        setLoading(false);
        setRefreshing(false);
        setIsFetchingPage(false);
      }
    },
    []
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchOrganizations(page, pageSize, debouncedSearch);
  }, [fetchOrganizations, page, pageSize, debouncedSearch]);

  const onRefresh = useCallback(() => {
    fetchOrganizations(page, pageSize, debouncedSearch, true);
  }, [fetchOrganizations, page, pageSize, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const displayCount = totalCount === 0 ? 0 : Math.min(page * pageSize, totalCount);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    if (newSize !== pageSize) {
      setPageSize(newSize);
      setPage(1);
    }
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleClearSearch = () => {
    setSearch('');
    setDebouncedSearch('');
    setPage(1);
  };

  const handleConfirmDelete = async () => {
    if (!orgToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await organizationsApi.delete(orgToDelete.id);
      const deletedName = orgToDelete.name;
      setOrgToDelete(null);
      toast.success(
        res.message || `Organization "${deletedName}" was successfully deleted.`,
        'Organization Deleted'
      );

      const nextTotal = Math.max(0, totalCount - 1);
      const nextTotalPages = Math.max(1, Math.ceil(nextTotal / pageSize));
      const targetPage = page > nextTotalPages ? nextTotalPages : page;
      if (targetPage !== page) {
        setPage(targetPage);
      } else {
        fetchOrganizations(targetPage, pageSize, debouncedSearch);
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setDeleteError(err.message);
      } else {
        setDeleteError('Failed to delete organization. Please check connection.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateSuccess = () => {
    setPage(1);
    fetchOrganizations(1, pageSize, debouncedSearch);
  };

  return {
    search,
    setSearch,
    handleClearSearch,
    page,
    pageSize,
    totalCount,
    totalPages,
    displayCount,
    handlePageChange,
    handlePageSizeChange,
    orgs,
    loading,
    refreshing,
    onRefresh,
    isFetchingPage,
    imageLoadErrors,
    setImageLoadErrors,
    orgToDelete,
    setOrgToDelete,
    isDeleting,
    deleteError,
    setDeleteError,
    handleCardPress,
    handleConfirmDelete,
    handleCreateSuccess,
    orgToEditLimits,
    setOrgToEditLimits,
    initialLimitsField,
    handleOpenEditLimits,
    handleUpdateLimitsSuccess,
    orgToEdit,
    setOrgToEdit,
    handleUpdateOrgSuccess,
  };
};

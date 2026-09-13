import { useState, useEffect, useCallback, useRef } from 'react';
import { ScrollView } from 'react-native';
import { adminsApi, AdminItem } from '../../../api/admins';
import { toast } from '../../../components/common/Toast';

export const useAdmins = (scrollViewRef?: React.RefObject<ScrollView | null>) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalCount, setTotalCount] = useState(0);
  const [isFetchingPage, setIsFetchingPage] = useState(false);
  const isFirstLoadRef = useRef(true);

  const [admins, setAdmins] = useState<AdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchAdmins = useCallback(
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

        const res = await adminsApi.list({
          page: targetPage,
          page_size: targetSize,
          search: targetSearch.trim() || undefined,
        });

        setAdmins(res.items || []);
        setTotalCount(res.total ?? 0);
      } catch {
        toast.error('Failed to fetch platform admins.');
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
    fetchAdmins(page, pageSize, debouncedSearch);
  }, [fetchAdmins, page, pageSize, debouncedSearch]);

  const handleRefresh = useCallback(() => {
    fetchAdmins(page, pageSize, debouncedSearch, true);
  }, [fetchAdmins, page, pageSize, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage);
      scrollViewRef?.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const deleteAdmin = async (admin: AdminItem) => {
    try {
      setActionLoadingId(admin.id);
      const res = await adminsApi.delete(admin.id);
      toast.success(res.message || `Admin '${admin.full_name}' successfully removed.`);
      const nextTotal = Math.max(0, totalCount - 1);
      const nextTotalPages = Math.max(1, Math.ceil(nextTotal / pageSize));
      const targetPage = page > nextTotalPages ? nextTotalPages : page;
      if (targetPage !== page) {
        setPage(targetPage);
      } else {
        fetchAdmins(targetPage, pageSize, debouncedSearch);
      }
    } catch {
      toast.error(`Failed to delete ${admin.full_name}.`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const addAdminToList = (_: AdminItem) => {
    setPage(1);
    fetchAdmins(1, pageSize, debouncedSearch);
  };

  const updateAdminInList = (updatedAdmin: AdminItem) => {
    setAdmins((prev) =>
      prev.map((a) => (a.id === updatedAdmin.id ? updatedAdmin : a))
    );
  };

  return {
    admins,
    loading,
    refreshing,
    isFetchingPage,
    search,
    setSearch,
    page,
    pageSize,
    totalCount,
    totalPages,
    actionLoadingId,
    handlePageChange,
    handleRefresh,
    deleteAdmin,
    addAdminToList,
    updateAdminInList,
  };
};

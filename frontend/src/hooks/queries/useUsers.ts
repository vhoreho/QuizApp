import { useQuery } from '@tanstack/react-query';
import { User, PaginationParams, SortParams, UsersResponse } from '@/lib/types';
import api from '@/api/axiosConfig';

export const USERS_KEYS = {
  all: ['users'] as const,
  lists: () => [...USERS_KEYS.all, 'list'] as const,
  list: (filters: UsersFilters) => [...USERS_KEYS.lists(), filters] as const,
  details: () => [...USERS_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...USERS_KEYS.details(), id] as const,
};

interface UsersFilters extends PaginationParams, SortParams<User> { }

const fetchUsers = async (filters: UsersFilters = {}): Promise<UsersResponse> => {
  const { page, limit, sortBy, sortOrder } = filters;
  const params = new URLSearchParams();

  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());
  if (sortBy) params.append('sortBy', sortBy.toString());
  if (sortOrder) params.append('sortOrder', sortOrder);

  const { data } = await api.get<UsersResponse>(`/users?${params.toString()}`);
  return data;
};

export const useUsers = (filters: UsersFilters = {}) => {
  return useQuery({
    queryKey: USERS_KEYS.list(filters),
    queryFn: () => fetchUsers(filters),
  });
};

export const useUser = (id: number) => {
  return useQuery({
    queryKey: USERS_KEYS.detail(id),
    queryFn: async () => {
      const { data } = await api.get<User>(`/users/${id}`);
      return data;
    },
  });
}; 
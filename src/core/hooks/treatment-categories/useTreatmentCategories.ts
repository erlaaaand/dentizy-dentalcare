import { useCallback } from 'react';
import type { QueryClient } from '@tanstack/react-query';
import {
  useTreatmentCategoriesControllerCreate,
  useTreatmentCategoriesControllerFindAll,
  useTreatmentCategoriesControllerFindOne,
  useTreatmentCategoriesControllerUpdate,
  useTreatmentCategoriesControllerRemove,
  useTreatmentCategoriesControllerRestore,
  treatmentCategoriesApi,
  treatmentCategoriesHelpers,
  getTreatmentCategoriesControllerFindAllQueryKey,
  getTreatmentCategoriesControllerFindOneQueryKey
} from '../../service/api/treatment-categories/treatment-categories.api';

import type {
  CreateTreatmentCategoryDto,
  UpdateTreatmentCategoryDto,
  TreatmentCategoriesControllerFindAllParams,
  TreatmentCategoryResponseDto,
  CreateTreatmentCategoryFormData,
  UpdateTreatmentCategoryFormData,
  TreatmentCategoryFilters,
  TreatmentCategoryValidation,
  TreatmentCategoryPaginatedResponse,
  TreatmentCategoryOption
} from '../../types/treatment-categories/treatment-categories.types';

/**
 * Hook untuk mendapatkan daftar treatment categories
 */
export const useTreatmentCategories = (
  params?: TreatmentCategoriesControllerFindAllParams,
  options?: {
    enabled?: boolean;
    refetchOnMount?: boolean;
  }
) => {
  const { enabled = true, refetchOnMount = true } = options || {};

  const query = useTreatmentCategoriesControllerFindAll(params, {
    query: {
      enabled,
      refetchOnMount,
      staleTime: 2 * 60 * 1000 // 2 minutes
    }
  });

  const categoriesData = query.data?.data as unknown as TreatmentCategoryPaginatedResponse | undefined;

  return {
    ...query,
    categories: categoriesData?.data || [],
    meta: categoriesData?.meta,
    totalCategories: categoriesData?.meta?.total || 0
  };
};

/**
 * Hook untuk mendapatkan single treatment category
 */
export const useTreatmentCategory = (
  id: number,
  options?: {
    enabled?: boolean;
  }
) => {
  const { enabled = true } = options || {};

  const query = useTreatmentCategoriesControllerFindOne(id, {
    query: {
      enabled: enabled && !!id
    }
  });

  const category = query.data?.data;

  return {
    ...query,
    category,
    status: category
      ? treatmentCategoriesApi.getCategoryStatus(category)
      : undefined
  };
};

/**
 * Hook untuk create treatment category
 */
export const useCreateTreatmentCategory = () => {
  const mutation = useTreatmentCategoriesControllerCreate();

  const createCategory = useCallback(
    async (data: CreateTreatmentCategoryDto) => {
      const response = await mutation.mutateAsync({ data });
      return response.data;
    },
    [mutation]
  );

  return {
    ...mutation,
    createCategory,
    isCreating: mutation.isPending
  };
};

/**
 * Hook untuk update treatment category
 */
export const useUpdateTreatmentCategory = () => {
  const mutation = useTreatmentCategoriesControllerUpdate();

  const updateCategory = useCallback(
    async (id: number, data: UpdateTreatmentCategoryDto) => {
      const response = await mutation.mutateAsync({ id, data });
      return response.data;
    },
    [mutation]
  );

  return {
    ...mutation,
    updateCategory,
    isUpdating: mutation.isPending
  };
};

/**
 * Hook untuk delete treatment category
 */
export const useDeleteTreatmentCategory = () => {
  const mutation = useTreatmentCategoriesControllerRemove();

  const deleteCategory = useCallback(
    async (id: number) => {
      await mutation.mutateAsync({ id });
    },
    [mutation]
  );

  return {
    ...mutation,
    deleteCategory,
    isDeleting: mutation.isPending
  };
};

/**
 * Hook untuk restore treatment category
 */
export const useRestoreTreatmentCategory = () => {
  const mutation = useTreatmentCategoriesControllerRestore();

  const restoreCategory = useCallback(
    async (id: number) => {
      const response = await mutation.mutateAsync({ id });
      return response.data;
    },
    [mutation]
  );

  return {
    ...mutation,
    restoreCategory,
    isRestoring: mutation.isPending
  };
};

/**
 * Hook untuk mendapatkan active categories sebagai options
 */
export const useTreatmentCategoryOptions = () => {
  const query = useTreatmentCategoriesControllerFindAll(
    { page: 1, limit: 1000 },
    {
      query: {
        staleTime: 5 * 60 * 1000 // 5 minutes
      }
    }
  );

  const categoriesData = query.data?.data as unknown as TreatmentCategoryPaginatedResponse | undefined;
  const categories = categoriesData?.data || [];

  const options: TreatmentCategoryOption[] = treatmentCategoriesHelpers
    .filterActive(categories)
    .map((category) => ({
      value: category.id,
      label: category.namaKategori,
      isActive: true
    }));

  return {
    ...query,
    options,
    optionsCount: options.length
  };
};

/**
 * Hook untuk validasi category data
 */
export const useTreatmentCategoryValidation = () => {
  const validate = useCallback(
    (
      data: CreateTreatmentCategoryFormData | UpdateTreatmentCategoryFormData
    ): TreatmentCategoryValidation => {
      return treatmentCategoriesApi.validate(data);
    },
    []
  );

  return {
    validate
  };
};

/**
 * Hook untuk treatment category actions
 */
export const useTreatmentCategoryActions = (queryClient: QueryClient) => {
  const invalidateAll = useCallback(async () => {
    await treatmentCategoriesApi.invalidateAll(queryClient);
  }, [queryClient]);

  const invalidateOne = useCallback(
    async (id: number) => {
      await treatmentCategoriesApi.invalidateOne(queryClient, id);
    },
    [queryClient]
  );

  const prefetchList = useCallback(
    async (params?: TreatmentCategoriesControllerFindAllParams) => {
      await treatmentCategoriesApi.prefetchList(queryClient, params);
    },
    [queryClient]
  );

  const prefetchOne = useCallback(
    async (id: number) => {
      await treatmentCategoriesApi.prefetchOne(queryClient, id);
    },
    [queryClient]
  );

  return {
    invalidateAll,
    invalidateOne,
    prefetchList,
    prefetchOne
  };
};

/**
 * Hook untuk filtering dan sorting categories
 */
export const useTreatmentCategoryFiltering = (
  categories: TreatmentCategoryResponseDto[]
) => {
  const filterActive = useCallback(() => {
    return treatmentCategoriesHelpers.filterActive(categories);
  }, [categories]);

  const filterDeleted = useCallback(() => {
    return treatmentCategoriesHelpers.filterDeleted(categories);
  }, [categories]);

  const searchByName = useCallback(
    (searchTerm: string) => {
      return treatmentCategoriesHelpers.searchByName(categories, searchTerm);
    },
    [categories]
  );

  const sortByName = useCallback(
    (order: 'asc' | 'desc' = 'asc') => {
      return treatmentCategoriesHelpers.sortByName(categories, order);
    },
    [categories]
  );

  const sortByDate = useCallback(
    (
      field: 'createdAt' | 'updatedAt' = 'createdAt',
      order: 'asc' | 'desc' = 'desc'
    ) => {
      return treatmentCategoriesHelpers.sortByDate(categories, field, order);
    },
    [categories]
  );

  const getSummary = useCallback(() => {
    return treatmentCategoriesHelpers.getSummary(categories);
  }, [categories]);

  return {
    filterActive,
    filterDeleted,
    searchByName,
    sortByName,
    sortByDate,
    getSummary
  };
};

/**
 * Hook untuk complete CRUD flow
 */
export const useTreatmentCategoryCRUD = (queryClient: QueryClient) => {
  const { createCategory, isCreating } = useCreateTreatmentCategory();
  const { updateCategory, isUpdating } = useUpdateTreatmentCategory();
  const { deleteCategory, isDeleting } = useDeleteTreatmentCategory();
  const { restoreCategory, isRestoring } = useRestoreTreatmentCategory();
  const { invalidateAll } = useTreatmentCategoryActions(queryClient);
  const { validate } = useTreatmentCategoryValidation();

  const create = useCallback(
    async (data: CreateTreatmentCategoryFormData): Promise<{
      success: boolean;
      data?: TreatmentCategoryResponseDto;
      validation?: TreatmentCategoryValidation;
      error?: Error;
    }> => {
      // Validate
      const validation = validate(data);
      if (!validation.isValid) {
        return { success: false, validation };
      }

      try {
        const result = await createCategory(data);
        await invalidateAll();
        return { success: true, data: result || undefined };
      } catch (error) {
        return { success: false, error: error as Error };
      }
    },
    [createCategory, validate, invalidateAll]
  );

  const update = useCallback(
    async (
      id: number,
      data: UpdateTreatmentCategoryFormData
    ): Promise<{
      success: boolean;
      data?: TreatmentCategoryResponseDto;
      validation?: TreatmentCategoryValidation;
      error?: Error;
    }> => {
      // Validate
      const validation = validate(data);
      if (!validation.isValid) {
        return { success: false, validation };
      }

      try {
        const result = await updateCategory(id, data);
        await invalidateAll();
        return { success: true, data: result || undefined };
      } catch (error) {
        return { success: false, error: error as Error };
      }
    },
    [updateCategory, validate, invalidateAll]
  );

  const remove = useCallback(
    async (id: number): Promise<{
      success: boolean;
      error?: Error;
    }> => {
      try {
        await deleteCategory(id);
        await invalidateAll();
        return { success: true };
      } catch (error) {
        return { success: false, error: error as Error };
      }
    },
    [deleteCategory, invalidateAll]
  );

  const restore = useCallback(
    async (id: number): Promise<{
      success: boolean;
      data?: TreatmentCategoryResponseDto;
      error?: Error;
    }> => {
      try {
        const result = await restoreCategory(id);
        await invalidateAll();
        return { success: true, data: result || undefined };
      } catch (error) {
        return { success: false, error: error as Error };
      }
    },
    [restoreCategory, invalidateAll]
  );

  return {
    create,
    update,
    remove,
    restore,
    isCreating,
    isUpdating,
    isDeleting,
    isRestoring,
    isLoading: isCreating || isUpdating || isDeleting || isRestoring
  };
};

/**
 * Hook untuk mendapatkan query keys
 */
export const useTreatmentCategoryQueryKeys = () => {
  const getListKey = useCallback(
    (params?: TreatmentCategoriesControllerFindAllParams) => {
      return getTreatmentCategoriesControllerFindAllQueryKey(params);
    },
    []
  );

  const getOneKey = useCallback((id: number) => {
    return getTreatmentCategoriesControllerFindOneQueryKey(id);
  }, []);

  return {
    getListKey,
    getOneKey
  };
};

// Export helpers
export { treatmentCategoriesHelpers };

// Export types
export type {
  CreateTreatmentCategoryDto,
  UpdateTreatmentCategoryDto,
  TreatmentCategoryResponseDto,
  TreatmentCategoryFilters,
  TreatmentCategoryValidation
};
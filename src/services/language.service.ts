import { apiClient } from '@/lib/api/client';
import type { ApiResponse, MarketplaceLanguage, PaginatedResponse } from '@/types';

export const languageService = {
  async getLanguages(
    params?: Record<string, string | number | boolean>,
  ): Promise<ApiResponse<PaginatedResponse<MarketplaceLanguage>>> {
    return apiClient.get<PaginatedResponse<MarketplaceLanguage>>('/languages/', { params });
  },
};

export default languageService;

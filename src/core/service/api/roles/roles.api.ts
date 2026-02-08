import {
  rolesControllerFindAll,
  rolesControllerFindOne,
} from "@/src/core/api/generated/roles/roles"
import type { ApiPaginatedResponse, UserRoleDto } from "@/src/core/types/roles/roles.types"
// --- RESPONSE WRAPPERS ---
export interface RolesResponse {
  data: UserRoleDto[]
}

export const RolesApi = {
  /**
   * Ambil semua roles
   */
  findAll: async (): Promise<UserRoleDto[]> => {
    const response = await rolesControllerFindAll()

    const typedResponse = response as unknown as RolesResponse | UserRoleDto[]

    if (Array.isArray(typedResponse)) {
      return typedResponse
    }

    return typedResponse.data || []
  },

  /**
   * Ambil semua roles dengan format paginated (jika backend mendukung)
   */
  findAllPaginated: async (): Promise<ApiPaginatedResponse<UserRoleDto>> => {
    const response = await rolesControllerFindAll()

    const typedResponse = response as unknown as ApiPaginatedResponse<UserRoleDto> | RolesResponse

    if ("meta" in typedResponse || "total" in typedResponse || "totalPages" in typedResponse) {
      return {
        data: typedResponse.data,
        meta: typedResponse.meta,
        total: typedResponse.total,
        totalPages: typedResponse.totalPages,
      }
    }

    return {
      data: (typedResponse as RolesResponse).data || [],
      meta: undefined,
    }
  },

  /**
   * Ambil satu role berdasarkan ID
   */
  findOne: async (id: string): Promise<UserRoleDto | null> => {
    if (!id) return null

    const response = await rolesControllerFindOne(id)

    const typedResponse = response as unknown as { data: UserRoleDto } | UserRoleDto

    if ("data" in typedResponse) {
      return typedResponse.data
    }

    return typedResponse || null
  },
}
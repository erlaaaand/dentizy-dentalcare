import { rolesControllerFindAll } from "@/src/core/api/generated/roles/roles"
import type { UserRoleDto } from "@/src/core/api/model"

export interface RolesResponse {
  data: UserRoleDto[]
}

export const RolesApi = {
  findAll: async (): Promise<UserRoleDto[]> => {
    const response = await rolesControllerFindAll()

    const typedResponse = response as unknown as RolesResponse | UserRoleDto[]
    
    if (Array.isArray(typedResponse)) {
      return typedResponse
    }
    
    return typedResponse.data || []
  },
}
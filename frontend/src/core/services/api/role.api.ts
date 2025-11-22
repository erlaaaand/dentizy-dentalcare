// frontend/src/core/services/api/role.api.ts
import {
  useRolesControllerFindAll,
  useRolesControllerFindOne,
} from '@/core/api/generated/roles/roles';

export {
  useRolesControllerFindAll as useGetRoles,
  useRolesControllerFindOne as useGetRole,
};
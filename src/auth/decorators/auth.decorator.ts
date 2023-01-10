import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { RoleProtected } from './';
import { validRoles } from '../interfaces/valid-roles';
import { UserRoleGuard } from '../guards/user-role-guard/user-role-guard.guard';

export function Auth(...roles: validRoles[]) {
  return applyDecorators(
    RoleProtected(...roles),
    UseGuards(AuthGuard(), UserRoleGuard),
  );
}

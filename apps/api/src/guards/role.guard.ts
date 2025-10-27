import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

export const ROLES_KEY = 'roles';

export enum UserRole {
  GUEST = 'guest',
  PROMOTER = 'promoter',
  DOOR = 'door',
  MANAGER = 'manager',
  ADMIN = 'admin',
}

export function Roles(...roles: UserRole[]) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(ROLES_KEY, roles, descriptor.value);
  };
}

@Injectable()
export class RoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.getRequiredRoles(context);
    
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException('Role not found in token');
    }

    const hasRole = requiredRoles.some((role) => role === user.role);
    
    if (!hasRole) {
      throw new ForbiddenException(
        `Insufficient permissions. Required roles: ${requiredRoles.join(', ')}`
      );
    }

    return true;
  }

  private getRequiredRoles(context: ExecutionContext): UserRole[] | undefined {
    const handler = context.getHandler();
    return Reflect.getMetadata(ROLES_KEY, handler);
  }
}

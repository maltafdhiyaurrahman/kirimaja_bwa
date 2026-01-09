import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PermissionsService } from "src/modules/permissions/permissions.service";
import { PERMISSIONS_KEY } from "../decorators/permissions.decorator";

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private permissionService: PermissionsService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.reflector.getAllAndOverride(
            PERMISSIONS_KEY,
            [context.getHandler(), context.getClass()],
        )

        if (!requiredPermissions) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('User not found in request');
        }

        if (
            typeof requiredPermissions === 'object' &&
            requiredPermissions.type
        ) {
            const { type, permissions } = requiredPermissions;

            let hasPermission = false;

            if(type === 'any') {
                hasPermission = await this.permissionService.userHasAnyPermission(
                    user.id,
                    permissions,
                );
            } else if (type === 'all') {
                hasPermission = await this.permissionService.userHasAllPermissions(
                    user.id,
                    permissions,
                );
            }

            if (!hasPermission) {
                throw new ForbiddenException(
                    `Access denied. Required permissions: ${permissions.join(', ')}`,
                );
            }
        } else {
            const permissions = Array.isArray(requiredPermissions)
                ? requiredPermissions
                : [requiredPermissions];
            const hasPermission =
                await this.permissionService.userHasAllPermissions(
                    user.id,
                    permissions,
                );

            if (!hasPermission) {
                throw new ForbiddenException(
                    `Access denied. Required permissions: ${permissions.join(', ')}`,
                );

            }
        }

        return true;
    }
}
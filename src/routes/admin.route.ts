import {Router} from 'express';
import {userController} from '@auth/controllers/user.controller';
import {updateUserStatusSchema} from '@auth/schemas/admin/update-user-status.schema';
import {updateUserVerifiedStatusSchema} from '@auth/schemas/admin/update-user-verified-status.schema';
import {roleController} from '@auth/controllers/role.controller';
import {createRoleSchema} from '@auth/schemas/role/create-role.schema';
import {handleAsyncError, validate} from '@hiep20012003/joblance-shared';

class AdminRoutes {
  private readonly router: Router;

  constructor() {
    this.router = Router();
  }

  public routes(): Router {
    // User Management
    this.router.get('/users', handleAsyncError(userController.getAllUsers));
    this.router.get('/users/:userId', handleAsyncError(userController.getUserById));
    this.router.put(
      '/users/:userId/status',
      validate(updateUserStatusSchema),
      handleAsyncError(userController.updateUserStatus)
    );
    this.router.put(
      '/users/:userId/verify',
      validate(updateUserVerifiedStatusSchema),
      handleAsyncError(userController.updateUserVerifiedStatus)
    );
    this.router.delete('/users/:userId', handleAsyncError(userController.deleteUser));

    // Role Management
    this.router.post('/roles', validate(createRoleSchema), handleAsyncError(roleController.createRole));
    this.router.get('/roles', handleAsyncError(roleController.getAllRoles));
    this.router.get('/roles/:roleId', handleAsyncError(roleController.getRoleById));
    this.router.put('/roles/:roleId', validate(createRoleSchema), handleAsyncError(roleController.updateRole));
    this.router.delete('/roles/:roleId', handleAsyncError(roleController.deleteRole));

    // User Role Management
    this.router.post('/users/:userId/roles', handleAsyncError(roleController.assignRoleToUser));
    this.router.delete('/users/:userId/roles/:roleId', handleAsyncError(roleController.unassignRoleFromUser));
    this.router.get('/users/:userId/roles', handleAsyncError(roleController.getUserRole));

    return this.router;
  }
}

export const adminRoutes: AdminRoutes = new AdminRoutes();

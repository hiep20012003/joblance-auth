import {Request, Response} from 'express';
import {roleService} from '@auth/services/role.service';
import {SuccessResponse} from '@hiep20012003/joblance-shared';
import {ReasonPhrases, StatusCodes} from 'http-status-codes';
import {Role} from '@auth/database/models/role.model';
import {UsersRoles} from '@auth/database/models/users-roles.model';
import {CreateAndUpdateRoleDTO} from '@auth/schemas/role/create-role.schema';

export class RoleController {
  public createRole = async (req: Request, res: Response): Promise<void> => {
    const {name, description} = req.body as CreateAndUpdateRoleDTO;
    const role: Role = await roleService.createRole(name, description);
    new SuccessResponse({
      message: 'Role created successfully',
      statusCode: StatusCodes.CREATED,
      reasonPhrase: ReasonPhrases.CREATED,
      data: role
    }).send(res);
  };

  public getAllRoles = async (_req: Request, res: Response): Promise<void> => {
    const roles: Role[] = await roleService.getAllRoles();
    new SuccessResponse({
      message: 'All roles retrieved successfully',
      statusCode: StatusCodes.OK,
      reasonPhrase: ReasonPhrases.OK,
      data: {roles}
    }).send(res);
  };

  public getRoleById = async (req: Request, res: Response): Promise<void> => {
    const {roleId} = req.params;
    const role: Role = await roleService.getRoleById(roleId); // No parseInt
    new SuccessResponse({
      message: 'Role retrieved successfully',
      statusCode: StatusCodes.OK,
      reasonPhrase: ReasonPhrases.OK,
      data: role
    }).send(res);
  };

  public updateRole = async (req: Request, res: Response): Promise<void> => {
    const {roleId} = req.params;
    const {name, description} = req.body as CreateAndUpdateRoleDTO;
    const updatedRole: Role = await roleService.updateRole(roleId, name, description);
    new SuccessResponse({
      message: 'Role updated successfully',
      statusCode: StatusCodes.OK,
      reasonPhrase: ReasonPhrases.OK,
      data: updatedRole
    }).send(res);
  };

  public deleteRole = async (req: Request, res: Response): Promise<void> => {
    const {roleId} = req.params;
    await roleService.deleteRole(roleId); // No parseInt
    new SuccessResponse({
      message: 'Role deleted successfully',
      statusCode: StatusCodes.OK,
      reasonPhrase: ReasonPhrases.OK
    }).send(res);
  };

  public assignRoleToUser = async (req: Request, res: Response): Promise<void> => {
    const {roleId} = req.body as { roleId: string };
    const {userId} = req.params;
    const userRole: UsersRoles = await roleService.assignRoleToUser(userId, roleId);
    new SuccessResponse({
      message: 'Role assigned to user successfully',
      statusCode: StatusCodes.CREATED,
      reasonPhrase: ReasonPhrases.CREATED,
      data: userRole
    }).send(res);
  };

  public unassignRoleFromUser = async (req: Request, res: Response): Promise<void> => {
    const {userId, roleId} = req.params;
    await roleService.unassignRoleFromUser(userId, roleId);
    new SuccessResponse({
      message: 'Role unassigned from user successfully',
      statusCode: StatusCodes.OK,
      reasonPhrase: ReasonPhrases.OK
    }).send(res);
  };

  public getUserRole = async (req: Request, res: Response): Promise<void> => {
    const {userId} = req.params;
    const UserRole: UsersRoles[] = await roleService.getUserRole(userId);
    new SuccessResponse({
      message: 'User roles retrieved successfully',
      statusCode: StatusCodes.OK,
      reasonPhrase: ReasonPhrases.OK,
      data: UserRole
    }).send(res);
  };
}

export const roleController: RoleController = new RoleController();

import {Role} from '@auth/database/models/role.model';
import {Resource} from '@auth/database/models/resource.model';
import {Permission} from '@auth/database/models/permission.model';

export type GrantsObject = {
  [roleName: string]: {
    [resourceName: string]: {
      [action: string]: string[];
    };
  };
};

export async function buildGrantsObject(): Promise<GrantsObject> {
  const permissions: Permission[] = await Permission.findAll({
    include: [
      {model: Role, as: 'role'},
      {model: Resource, as: 'resource'}
    ]
  });

  const grants: GrantsObject = {};

  for (const perm of permissions) {
    const role = perm.role!.name;
    const resource = perm.resource!.name;
    const action = perm.action;
    const attributes = perm.attributes.split(',').map((a: string) => a.trim());

    if (!grants[role]) {
      grants[role] = {} as GrantsObject[string];
    }

    if (!grants[role][resource]) {
      grants[role][resource] = {} as GrantsObject[string][string];
    }

    grants[role][resource][action] = attributes;
  }

  return grants;
}

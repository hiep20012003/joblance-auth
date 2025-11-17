import {IBuyerMessageQueue, ISellerMessageQueue, MessageQueueType} from '@hiep20012003/joblance-shared';
import {AppLogger} from '@auth/utils/logger';
import {roleService} from '@auth/services/role.service';
import {userService} from '@auth/services/user.service';

export async function handleUserMessage<T extends Required<ISellerMessageQueue & IBuyerMessageQueue>>(payload: T): Promise<void> {
  const {type} = payload;

  switch (type) {
    case MessageQueueType.SELLER_CREATED: {
      const {sellerId} = payload;

      const role = await roleService.getRoleByName('seller');

      await roleService.assignRoleToUser(sellerId, role.id!);
      break;
    }

    case MessageQueueType.PROFILE_PICTURE_UPDATED: {
      const {profilePicture, buyerId} = payload;

      await userService.updateUserProfilePicture(buyerId, profilePicture);
      break;
    }

    default:
      AppLogger.warn(`[User Handler] Unhandled event type: ${type}`, {operation: 'consumer:handler'});
      break;
  }
}

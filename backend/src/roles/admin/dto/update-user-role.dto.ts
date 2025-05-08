import { IsEnum } from 'class-validator';
import { UserRole } from '../../../users/entities/user.entity';

export class UpdateUserRoleDto {
  @IsEnum(UserRole)
  role: UserRole;
}

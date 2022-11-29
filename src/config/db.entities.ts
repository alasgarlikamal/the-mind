import { Avatar } from 'src/avatars/entities/avatar.entity';
import { User } from 'src/users/entities/user.entity';
import { About } from 'src/about/entities/about.entity';
import { ConfirmMailToken } from 'src/auth/entities/confirmMailToken.entity';
import { ConfirmPasswordToken } from 'src/auth/entities/confirmPasswordToken.entity';

export const entities = [User, Avatar, About, ConfirmMailToken, ConfirmPasswordToken];

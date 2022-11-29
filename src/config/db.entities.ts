import { Avatar } from 'src/avatars/entities/avatar.entity';
import { User } from 'src/users/entities/user.entity';
import { About } from 'src/about/entities/about.entity';
import { ConfirmToken } from 'src/auth/entities/confirmToken.entity';
import { ConfirmTokenPwd } from 'src/auth/entities/confirmTokenPwd.entity';

export const entities = [User, Avatar, About, ConfirmToken, ConfirmTokenPwd];

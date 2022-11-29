import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class ConfirmPasswordToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  token: string;

  @Column({ type: 'varchar', unique: true })
  password: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}

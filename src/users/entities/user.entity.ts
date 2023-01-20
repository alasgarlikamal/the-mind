import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Avatar } from 'src/avatars/entities/avatar.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 64, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 64 })
  firstname: string;

  @Column({ type: 'varchar', length: 64 })
  lastname: string;

  @Column({ type: 'varchar', length: 64, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 1024 })
  password: string;

  @BeforeInsert()
  async hashPassword() {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
  }

  @Column({ type: 'date' })
  date_of_birth: Date;

  @Column({ type: 'boolean' })
  gender: Boolean;

  @Column({ type: 'int', default: 0 })
  number_of_games_played: number;

  @Column({ type: 'int', default: 0 })
  max_level_reached: number;

  @Column({ type: 'int', default: 300 })
  elo: number;

  @ManyToOne(() => Avatar, (avatar) => avatar.users)
  @JoinColumn()
  avatar: Avatar;

  @Column({type: 'boolean', default: false})
  isActive: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

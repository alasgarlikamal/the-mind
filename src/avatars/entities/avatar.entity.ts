import { About } from 'src/about/entities/about.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'avatars' })
export class Avatar {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 1024 })
  imageUrl: string;

  @OneToMany(() => User, (user) => user.avatar)
  users: User[];

  @OneToOne(() => About)
  about: About;

  @Column({ type: 'boolean' })
  isActive: boolean;

}

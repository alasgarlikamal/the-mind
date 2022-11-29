import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ConfirmMailToken{

    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'varchar', unique: true})
    token: string;

    @OneToOne(() => User)
    @JoinColumn()
    user: User
}
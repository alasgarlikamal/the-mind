import { Avatar } from "src/avatars/entities/avatar.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'about'})
export class About {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 64, unique: true })
    fullName:string;

    @Column({ type: 'varchar', length: 64 })
    role: string;

    @Column({type: 'text'})
    text:string;

    @OneToOne(() => Avatar)
    @JoinColumn()
    avatar: Avatar;

}
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";


@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column() 
  email!: string

  @Column()
  password!: string;

  @Column()
  isVerified!: boolean;
}
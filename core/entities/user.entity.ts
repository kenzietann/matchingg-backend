import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";


@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  email!: string;

  @Column({ type: 'varchar' })
  password!: string;

  @Column({ type: 'boolean' })
  isVerified!: boolean;
}
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";


@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  email!: string;

  @Column({ type: 'varchar', nullable: true })
  password!: string | null;

  @Column({ type: 'boolean', default: false })
  isVerified!: boolean;

  @Column({ type: 'varchar', default: 'free'})
  plan!: 'free' | 'paid';

  @Column({ nullable: true, unique: true, type: 'varchar' })
  googleId!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
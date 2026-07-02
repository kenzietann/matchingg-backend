import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";


@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column() // Explicitly set column type because TSX ignored my tsconfig and caused a runtime error
  name!: string;
}
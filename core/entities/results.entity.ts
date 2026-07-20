import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('results')
export class ResultsEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  userId!: number;

  @Column({ type: 'varchar', nullable: true })
  jobTitle!: string | null;

  @Column({ type: 'varchar', nullable: true })
  companyName!: string | null;

  @Column({ type: 'int' })
  score!: number;

  @Column({ type: 'varchar' })
  label!: string;

  @Column({ type: 'int' })
  percentile!: number;

  @Column({ type: 'json' })
  breakdown!: {
    skills_match: number;
    experience_level: number;
    keyword_alignment: number;
    culture_tone_fit: number;
    language_clarity: number;
  }

  @Column({ type: 'json' })
  strengths!: string[];

  @Column({ type: 'json' })
  gaps!: string[];

  @Column({ type: 'text' })
  recommendation!: string;

  @Column({ type: 'varchar', unique: true })
  cacheKey!: string;

  @CreateDateColumn()
  createdAt!: Date;
};

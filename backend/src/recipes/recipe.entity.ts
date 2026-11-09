import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

// A "saved recipe" belongs to ONE user. Favorite flag and rating live on the same row
// (simple!). The alternative (separate favorites/ratings tables) is explained in the guide.
@Entity('recipes')
export class Recipe {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 120 })
  title!: string;

  @Column('text')
  description!: string;

  // jsonb = Postgres' binary JSON column. Perfect for small string lists.
  @Column('jsonb')
  ingredients!: string[];

  @Column('jsonb')
  steps!: string[];

  @Column({ type: 'int', default: 30 })
  cookTimeMinutes!: number;

  @Column({ type: 'text', nullable: true })
  imageUrl!: string | null;

  @Column({ default: false })
  isFavorite!: boolean;

  @Column({ type: 'int', nullable: true })
  rating!: number | null; // 1-5, null = not rated yet

  @Index() // we always filter by userId, so index it
  @Column()
  userId!: string;

  @ManyToOne(() => User, (user) => user.recipes, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;
}

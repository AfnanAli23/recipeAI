import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Recipe } from '../recipes/recipe.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  // select:false => the hash is NOT returned by normal queries.
  // We must ask for it explicitly (only the login code does).
  @Column({ select: false })
  passwordHash!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => Recipe, (recipe) => recipe.user)
  recipes!: Recipe[];
}

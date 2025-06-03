import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { College } from './college.entity';

@Entity('category_sections')
export class CategorySection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ type: 'varchar', length: 255 })
  icon: string;

  @Column({ type: 'boolean', default: false })
  expanded: boolean;

  @OneToMany(() => College, college => college.categorySection)
  colleges: College[];
}
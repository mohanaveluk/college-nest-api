import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { State } from './state.entity';
import { College } from './college.entity';
import { District } from './district.entity';

@Entity('countries')
export class Country {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 10 })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @OneToMany(() => State, state => state.country)
  states: State[];

  @OneToMany(() => District, district => district.country)
  districts: District[];

  @OneToMany(() => College, college => college.country)
  colleges: College[];
}
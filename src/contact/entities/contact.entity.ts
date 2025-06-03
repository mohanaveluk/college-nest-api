import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('contacts')
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  subject: string;

  @Column('text')
  message: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ default: false })
  is_read: boolean;
}
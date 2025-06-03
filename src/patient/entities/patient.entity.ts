import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ type: 'timestamp' })
  dateOfBirth: Date;

  @Column()
  gender: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  address: string;

  @Column({ nullable: true })
  insuranceProvider: string;

  @Column({ nullable: true })
  insuranceNumber: string;

  @Column({ type: 'timestamp', nullable: true })
  insuranceExpiryDate: Date;

  @Column('simple-array', { nullable: true })
  medicalHistory: string[];

  @Column('simple-array', { nullable: true })
  allergies: string[];

  @Column('simple-array', { nullable: true })
  chronicConditions: string[];

  @Column('simple-array', { nullable: true })
  currentMedications: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
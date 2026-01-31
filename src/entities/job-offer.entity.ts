import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum JobContractType {
  CDI = 'CDI',
  CDD = 'CDD',
  INTERN = 'INTERN',
  FREELANCE = 'FREELANCE',
}

export enum JobOfferStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

@Entity('job_offers')
export class JobOffer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  position: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  requiredSkills: string;

  @Column({ type: 'enum', enum: JobContractType })
  contractType: JobContractType;

  @Column({ type: 'enum', enum: JobOfferStatus, default: JobOfferStatus.OPEN })
  status: JobOfferStatus;

  @Column({ type: 'date', nullable: true })
  deadline: string | null;

  @CreateDateColumn()
  createdAt: Date;
}

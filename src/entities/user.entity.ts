import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum UserRole {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
}
export enum EmployeePosition {
  WEB = 'WEB',
  MOBILE = 'MOBILE',
  AI = 'AI',
  HR = 'HR',
  TREASURER = 'TREASURER',
  IOT = 'IOT',
}


@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ length: 255 })
  email: string;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ length: 255 })
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.EMPLOYEE })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  // For "must change password on first login"
  @Column({ default: true })
  mustChangePassword: boolean;
    @Column({ type: 'enum', enum: EmployeePosition, nullable: true })
    position: EmployeePosition | null;

  // Optional: store refresh token hash if you implement refresh
  @Column({ type: 'varchar', length: 255, nullable: true })
  refreshTokenHash: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
 @Column({ type: 'varchar', length: 255, nullable: true })
personalEmail: string | null;


}

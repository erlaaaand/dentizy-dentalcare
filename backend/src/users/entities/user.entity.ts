import { Role } from '../../roles/entities/role.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { MedicalRecord } from '../../medical_records/entities/medical_record.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 250 })
  @Index('idx_user_nama') // Index untuk pencarian by nama
  nama_lengkap: string;

  @Column({ length: 50, unique: true })
  @Index('idx_user_username') // Index untuk login (search by username)
  username: string;

  @Column({ length: 255 })
  @Exclude()
  password: string;

  @CreateDateColumn()
  @Index('idx_user_created_at') // Index untuk sorting
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'text', nullable: true })
  profile_photo: string;

  @ManyToMany(() => Role, (role) => role.users, {
    cascade: true,
  })
  @JoinTable({
    name: 'users_roles',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
  })
  roles: Role[];

  @OneToMany(() => MedicalRecord, (record) => record.user_staff)
  medical_records: MedicalRecord[];
}
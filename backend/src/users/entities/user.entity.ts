import { Role } from '../../roles/entities/role.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';

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
}
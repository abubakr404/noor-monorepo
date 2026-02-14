export interface UserEntity {
  id: string;
  email: string | null;
  passwordHash: string | null;
  name: string | null;
  provider: string;
  providerId: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

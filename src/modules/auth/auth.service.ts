import { Injectable, UnauthorizedException, BadRequestException , Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { nanoid } from 'nanoid';
import { User,UserRole } from '../../entities/user.entity';
import { PasswordResetToken } from '../../entities/password-reset-token.entity';

@Injectable()
export class AuthService implements OnModuleInit{
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(PasswordResetToken) private resetRepo: Repository<PasswordResetToken>,
    private jwt: JwtService,
  ) {}

  private async signTokens(user: User) {
    const payload = { sub: user.id, role: user.role, email: user.email };

    const accessToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: (process.env.JWT_ACCESS_EXPIRES || '15m') as any,
    });

    // optional refresh
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: (process.env.JWT_REFRESH_EXPIRES || '7d') as any,
    });

    return { accessToken, refreshToken };
  }

  async login(email: string, password: string) {
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.isActive) throw new UnauthorizedException('Account disabled');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.signTokens(user);

    if (tokens.refreshToken) {
      user.refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
      await this.usersRepo.save(user);
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
      ...tokens,
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user || !user.isActive) return { ok: true };

    await this.resetRepo.update({ user: { id: user.id } as any, used: false }, { used: true });

    const rawToken = nanoid(48);
    const tokenHash = await bcrypt.hash(rawToken, 10);

    const minutes = Number(process.env.RESET_TOKEN_EXPIRES_MIN || 30);
    const expiresAt = new Date(Date.now() + minutes * 60_000);

    const record = this.resetRepo.create({ user, tokenHash, expiresAt, used: false });
    await this.resetRepo.save(record);

   
    return { ok: true };
  }

  async resetPassword(token: string, newPassword: string) {
    // find not used and not expired; we must scan and compare hash
    const candidates = await this.resetRepo.find({
      where: { used: false, expiresAt: MoreThan(new Date()) },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: 20, // prevent heavy scan
    });

    const match = await this.findMatchingToken(candidates, token);
    if (!match) throw new BadRequestException('Invalid or expired token');

    const user = match.user;
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.mustChangePassword = false;

    await this.usersRepo.save(user);

    match.used = true;
    await this.resetRepo.save(match);

    return { ok: true };
  }

  private async findMatchingToken(records: PasswordResetToken[], rawToken: string) {
    for (const r of records) {
      const ok = await bcrypt.compare(rawToken, r.tokenHash);
      if (ok) return r;
    }
    return null;
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) throw new BadRequestException('Wrong current password');

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.mustChangePassword = false;
    await this.usersRepo.save(user);

    return { ok: true };
  }

  async me(userId: number) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      isActive: user.isActive,
    };
  }
  async onModuleInit(): Promise<void> {
  const adminEmail = 'admin@company.com';

  const exists = await this.usersRepo.findOne({
    where: { email: adminEmail },
  });

  if (exists) {
    Logger.log('Admin already exists', 'AuthService');
    return;
  }

  const passwordHash = await bcrypt.hash('Admin123!', 10);

  const admin = this.usersRepo.create({
    email: adminEmail,
    firstName: 'Admin',
    lastName: 'System',
    passwordHash,
    role:  UserRole.ADMIN, 
    isActive: true,
    mustChangePassword: false,
  });

  await this.usersRepo.save(admin);

  Logger.warn('✅ Default admin created', 'AuthService');
  Logger.warn('📧 admin@company.com', 'AuthService');
  Logger.warn('🔑 Admin123!', 'AuthService');
}
async logout(userId: number) {
  await this.usersRepo.update(
    { id: userId },
    { refreshTokenHash: null },
  );

  return { ok: true };
}


}

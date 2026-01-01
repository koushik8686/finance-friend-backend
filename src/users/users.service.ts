import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/browser';
import { DatabaseService } from 'src/database/database.service';
import axios from 'axios';

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  async create(createUserDto: Prisma.UserCreateInput) {
    try {
      return await this.db.client.user.create({
        data: createUserDto,
      });
    } catch (e) {
      console.error(e);
      throw new BadRequestException('Invalid data');
    }
  }

  findAll() {
    return this.db.client.user.findMany();
  }

  findOne(id: number) {
    return this.db.client.user.findUnique({
      where: { id },
    });
  }

  update(id: number, updateUserDto: Prisma.UserUpdateInput) {
    return this.db.client.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  remove(id: number) {
    return this.db.client.user.delete({
      where: { id },
    });
  }

  // fetch userinfo from Google using access token
  private async getUserInfo(accessToken: string) {
    try {
      const userRes = await axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accessToken}`,
        { headers: { Accept: 'application/json' } },
      );
      return userRes.data;
    } catch (err: any) {
      console.error(
        'Failed to fetch Google userinfo',
        err?.response?.data || err?.message || err,
      );
      throw new BadRequestException('Invalid Google access token');
    }
  }

  // upsert user and return user record
  async googlelogin(token: string) {
    const userInfo = await this.getUserInfo(token);
    const { email, name, picture } = userInfo;

    if (!email) {
      throw new BadRequestException('Google account has no email');
    }

    const user = await this.db.client.user.upsert({
      where: { email },
      create: {
        email,
        name: name || undefined,
        avatar: picture || undefined,
        balance: 0,
      },
      update: {
        name: name || undefined,
        avatar: picture || undefined,
      },
    });

    return { user, token };
  }
}

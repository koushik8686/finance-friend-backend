import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import axios from 'axios';

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  async create(createUserDto: Prisma.UserCreateInput) {
    try {
      return await this.db.user.create({ data: createUserDto });
    } catch (e) {
      console.log(e);
      throw new BadRequestException('Invalid data');
    }
  }

  findAll() {
    return this.db.user.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: Prisma.UserUpdateInput) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  // fetch userinfo from Google using access token
  private async getUserInfo(accessToken: string) {
    try {
      const userRes = await axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accessToken}`,
        { headers: { Accept: 'application/json' } }
      );
      return userRes.data;
    } catch (err) {
      console.error('Failed to fetch Google userinfo', err?.response?.data || err.message || err);
      throw new BadRequestException('Invalid Google access token');
    }
  }

  // upsert user and return user record
  async googlelogin(token: string) {
    const userInfo = await this.getUserInfo(token);
    const { email, name, picture } = userInfo;
    console.log(userInfo)
    if (!email) throw new BadRequestException('Google account has no email');

    // adapt fields to your Prisma schema — adjust create/update data as needed
    const user = await this.db.user.upsert({
      where: { email },
      create: {
        email,
        name: name || undefined,
        avatar: picture || undefined,
        balance:0
      } as any,
      update: {
        name: name || undefined,
        avatar: picture || undefined,
      } as any,
    });

    return {user , token}
  }
}


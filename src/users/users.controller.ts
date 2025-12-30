// ...existing code...
import { Controller, Get, Post, Body, Patch, Param, Delete, Req, BadRequestException , Query } from '@nestjs/common';
import { UsersService } from './users.service';
// import { Prisma } from '@prisma/client';
import { Prisma } from 'generated/prisma/browser';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: Prisma.UserCreateInput) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: Prisma.UserUpdateInput) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  // --- Google login endpoint: accepts many token shapes (tokens or header) ---
  @Get('/login/google')
  async googlelogin(@Query() query: any) {
    // Example query shapes:
    // ?tokens[access_token]=xxx
    // ?access_token=xxx

    let token: string | undefined;

    // Case 1: tokens.access_token (most common)
    if (query?.tokens?.access_token) {
      token = query.tokens.access_token;

    // Case 2: encoded query like tokens[access_token]
    } else if (query?.['tokens[access_token]']) {
      token = query['tokens[access_token]'];

    // Case 3: direct access_token
    } else if (query?.access_token) {
      token = query.access_token;
    }

    if (!token) {
      throw new BadRequestException('Missing Google access token');
    }

    return this.usersService.googlelogin(token);
  }
}
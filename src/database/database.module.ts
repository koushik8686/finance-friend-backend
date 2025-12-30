import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import {ThrottlerModule , ThrottlerGuard} from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core';

@Module({
  
  providers: [DatabaseService],
  exports:[DatabaseService]
})
export class DatabaseModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import 'dotenv/config';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [DatabaseModule, UsersModule],
})
export class AppModule {}

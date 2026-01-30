import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { Prisma } from '../generated/prisma/client';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) { }

  @Post()
  create(@Body() createTransactionDto: Prisma.TransactionsCreateInput) {
    return this.transactionsService.create(createTransactionDto);
  }

  @Get()
  findAll() {
    return this.transactionsService.findAll();
  }

  @Get('user/:id')
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(+id);
  }

  @Get('analytics/:userId')
  getAnalytics(
    @Param('userId') userId: string,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    return this.transactionsService.getAnalytics(+userId, year ? +year : undefined, month ? +month : undefined);
  }

  @Get('calendar/:userId')
  getCalendarData(
    @Param('userId') userId: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.transactionsService.getCalendarData(+userId, +year, +month);
  }

  @Get('date-range/:userId')
  getByDateRange(
    @Param('userId') userId: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.transactionsService.getByDateRange(+userId, start, end);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTransactionDto: Prisma.TransactionsUpdateInput) {
    return this.transactionsService.update(+id, updateTransactionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transactionsService.remove(+id);
  }
}

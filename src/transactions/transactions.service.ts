import { Injectable, BadRequestException } from '@nestjs/common';

import { DatabaseService } from '../database/database.service';

@Injectable()
export class TransactionsService {

  constructor(private readonly db: DatabaseService) { }

  async create(dto) {
    let {
      userId,
      amount,
      description,
      category,
      party,
      type,
      date,
      time,
      location,
    } = dto;

    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }
    amount = amount - 0
    // 1️⃣ Check user exists
    const user = await this.db.client.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // 2️⃣ Find or create CATEGORY
    let categoryRecord = await this.db.client.categories.findFirst({
      where: {
        name: category,
        userId,
      },
    });

    if (!categoryRecord) {
      categoryRecord = await this.db.client.categories.create({
        data: {
          name: category,
          user: { connect: { id: userId } },
        },
      });
    }

    // 3️⃣ Find or create PARTY
    let partyRecord = await this.db.client.party.findFirst({
      where: {
        name: party,
        userId,
      },
    });

    if (!partyRecord) {
      partyRecord = await this.db.client.party.create({
        data: {
          name: party,
          user: { connect: { id: userId } },
        },
      });
    }

    // 4️⃣ Create TRANSACTION
    const transaction = await this.db.client.transactions.create({
      data: {
        amount,
        date,
        description,
        type,
        time: time ? time : " ",
        location,

        user: { connect: { id: userId } },
        category: { connect: { id: categoryRecord.id } },
        party: { connect: { id: partyRecord.id } },
      },
    });

    // 5️⃣ Update USER BALANCE
    await this.db.client.user.update({
      where: { id: userId },
      data: {
        balance:
          type === 'Income'
            ? user.balance + amount
            : user.balance - amount,
      },
    });

    return transaction;
  }
  findAll() {
    return `This action returns all transactions`;
  }

  findOne(id: number) {
    return this.db.client.transactions.findMany({
      where: { userId: id },
      include: {
        category: {
          select: { name: true },
        },
        party: {
          select: { name: true },
        },
      },
    });
  }


  async update(id: number, updateTransactionDto: any) {
    // Find the existing transaction to calculate balance diff
    const existing = await this.db.client.transactions.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new BadRequestException('Transaction not found');
    }

    // Only pick the fields we allow updating
    const dataToUpdate: any = {};
    if (updateTransactionDto.amount !== undefined) {
      dataToUpdate.amount = Number(updateTransactionDto.amount);
    }
    if (updateTransactionDto.description !== undefined) {
      dataToUpdate.description = updateTransactionDto.description;
    }
    if (updateTransactionDto.date !== undefined) {
      dataToUpdate.date = updateTransactionDto.date;
    }
    if (updateTransactionDto.time !== undefined) {
      dataToUpdate.time = updateTransactionDto.time;
    }

    const updated = await this.db.client.transactions.update({
      where: { id },
      data: dataToUpdate,
      include: {
        category: { select: { name: true } },
        party: { select: { name: true } },
      },
    });

    // Adjust user balance if amount changed
    if (dataToUpdate.amount !== undefined && dataToUpdate.amount !== existing.amount) {
      const diff = dataToUpdate.amount - existing.amount;
      // If income, increase balance by diff; if expense, decrease balance by diff
      const balanceChange = existing.type === 'Income' ? diff : -diff;
      await this.db.client.user.update({
        where: { id: existing.userId },
        data: { balance: { increment: balanceChange } },
      });
    }

    return updated;
  }

  async remove(id: number) {
    // Find the transaction first to reverse balance
    const transaction = await this.db.client.transactions.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new BadRequestException('Transaction not found');
    }

    // Delete the transaction
    await this.db.client.transactions.delete({
      where: { id },
    });

    // Reverse the balance effect on the user
    const balanceChange = transaction.type === 'Income'
      ? -transaction.amount   // Remove income: decrease balance
      : transaction.amount;   // Remove expense: increase balance

    await this.db.client.user.update({
      where: { id: transaction.userId },
      data: { balance: { increment: balanceChange } },
    });

    return { message: 'Transaction deleted successfully' };
  }

  async getAnalytics(userId: number, year?: number, month?: number) {
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month !== undefined ? month : now.getMonth();

    // Get all transactions for the user
    const transactions = await this.db.client.transactions.findMany({
      where: { userId },
      include: {
        category: { select: { name: true } },
        party: { select: { name: true } },
      },
    });

    // Filter by month if specified
    const filtered = transactions.filter(t => {
      if (!t.date) return false;
      const txDate = new Date(t.date);
      return txDate.getFullYear() === targetYear && txDate.getMonth() === targetMonth;
    });

    // Calculate totals
    let totalIncome = 0;
    let totalExpense = 0;
    const categoryBreakdown: Record<string, number> = {};
    const partyBreakdown: Record<string, number> = {};

    filtered.forEach(tx => {
      if (tx.type === 'Income') {
        totalIncome += tx.amount;
      } else {
        totalExpense += tx.amount;
        // Category breakdown for expenses
        const catName = tx.category.name;
        categoryBreakdown[catName] = (categoryBreakdown[catName] || 0) + tx.amount;
        // Party breakdown
        const partyName = tx.party.name;
        partyBreakdown[partyName] = (partyBreakdown[partyName] || 0) + tx.amount;
      }
    });

    return {
      year: targetYear,
      month: targetMonth,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      categoryBreakdown,
      partyBreakdown,
      transactionCount: filtered.length,
    };
  }

  async getCalendarData(userId: number, year: number, month: number) {
    const transactions = await this.db.client.transactions.findMany({
      where: { userId },
      include: {
        category: { select: { name: true } },
        party: { select: { name: true } },
      },
    });

    // Filter transactions for the specific month
    const monthTransactions = transactions.filter(t => {
      if (!t.date) return false;
      const txDate = new Date(t.date);
      return txDate.getFullYear() === year && txDate.getMonth() === month;
    });

    // Group by day
    const dayData: Record<number, { income: number; expense: number; count: number; transactions: any[] }> = {};

    monthTransactions.forEach(tx => {
      if (!tx.date) return;
      const day = new Date(tx.date).getDate();
      if (!dayData[day]) {
        dayData[day] = { income: 0, expense: 0, count: 0, transactions: [] };
      }

      if (tx.type === 'Income') {
        dayData[day].income += tx.amount;
      } else {
        dayData[day].expense += tx.amount;
      }
      dayData[day].count++;
      dayData[day].transactions.push(tx);
    });

    // Calculate monthly totals
    let totalIncome = 0;
    let totalExpense = 0;
    monthTransactions.forEach(tx => {
      if (tx.type === 'Income') totalIncome += tx.amount;
      else totalExpense += tx.amount;
    });

    return {
      year,
      month,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      dayData,
      transactions: monthTransactions,
    };
  }

  async getByDateRange(userId: number, startDate: string, endDate: string) {
    const transactions = await this.db.client.transactions.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: { select: { name: true } },
        party: { select: { name: true } },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return transactions;
  }

}

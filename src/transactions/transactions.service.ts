import { Injectable , BadRequestException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class TransactionsService {

  constructor(private readonly db : DatabaseService){}

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
    amount=amount-0
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


  update(id: number, updateTransactionDto: Prisma.TransactionsUpdateInput) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: number) {
    return this.db.client.transactions.delete({
      where: { id },
    });
  }

}

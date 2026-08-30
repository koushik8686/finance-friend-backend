import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';

@Injectable()
export class RecordsService {
  constructor(private readonly db: DatabaseService) {}

  private toRow(dto: CreateRecordDto) {
    if (dto.pkg == null || dto.when == null || dto.screen == null) {
      throw new BadRequestException('pkg, when, and screen are required');
    }
    if (!Array.isArray(dto.screen)) {
      throw new BadRequestException('screen must be an array');
    }

    return {
      pkg: String(dto.pkg),
      amount: dto.amount == null ? '' : String(dto.amount),
      when: BigInt(dto.when),
      screen: dto.screen,
    };
  }

  private serialize(record: any) {
    if (!record) return record;
    return {
      ...record,
      when: typeof record.when === 'bigint' ? Number(record.when) : record.when,
    };
  }

  async create(createRecordDto: CreateRecordDto | CreateRecordDto[]) {
    if (Array.isArray(createRecordDto)) {
      if (createRecordDto.length === 0) {
        throw new BadRequestException('Records array cannot be empty');
      }
      const created = await this.db.client.records.createManyAndReturn({
        data: createRecordDto.map((dto) => this.toRow(dto)),
      });
      return created.map((row) => this.serialize(row));
    }

    const record = await this.db.client.records.create({
      data: this.toRow(createRecordDto),
    });
    return this.serialize(record);
  }

  async findAll() {
    const records = await this.db.client.records.findMany({
      orderBy: { when: 'desc' },
    });
    return records.map((row) => this.serialize(row));
  }

  async findOne(id: number) {
    const record = await this.db.client.records.findUnique({
      where: { id },
    });
    if (!record) {
      throw new NotFoundException('Record not found');
    }
    return this.serialize(record);
  }

  async update(id: number, updateRecordDto: UpdateRecordDto) {
    const existing = await this.db.client.records.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Record not found');
    }

    const data: any = {};
    if (updateRecordDto.pkg !== undefined) data.pkg = String(updateRecordDto.pkg);
    if (updateRecordDto.amount !== undefined) data.amount = String(updateRecordDto.amount);
    if (updateRecordDto.when !== undefined) data.when = BigInt(updateRecordDto.when);
    if (updateRecordDto.screen !== undefined) {
      if (!Array.isArray(updateRecordDto.screen)) {
        throw new BadRequestException('screen must be an array');
      }
      data.screen = updateRecordDto.screen;
    }

    const updated = await this.db.client.records.update({
      where: { id },
      data,
    });
    return this.serialize(updated);
  }

  async remove(id: number) {
    const existing = await this.db.client.records.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Record not found');
    }

    await this.db.client.records.delete({
      where: { id },
    });
    return { message: 'Record deleted successfully' };
  }
}

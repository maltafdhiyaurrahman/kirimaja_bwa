import { Module } from '@nestjs/common';
import { HistoryService } from './history.service';
import { HistoryController } from './history.controller';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { PermissionsService } from '../permissions/permissions.service';

@Module({
  controllers: [HistoryController],
  providers: [HistoryService, PrismaService, PermissionsService],
})
export class HistoryModule {}

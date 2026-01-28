import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { HistoryService } from './history.service';
import { Shipment, User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/logged-in.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { BaseResponse } from 'src/common/interface/base-interface.response';

@Controller('history')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  @RequirePermissions('history.read')
  async findAll(
    @Req() req: Request & {user?: User}
  ): Promise<BaseResponse<Shipment[]>> {
    return {
      message: 'History retrivied successfully',
      data: await this.historyService.findAll(req.user!)
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise< BaseResponse<Shipment>> {
    return {
      message: 'Shipment retrivied successfully',
      data: await this.historyService.findOne(+id)
    }
  }
}

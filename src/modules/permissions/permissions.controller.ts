import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { JwtAuthGuard } from '../auth/guards/logged-in.guard';
import { BaseResponse } from 'src/common/interface/base-interface.response';

@Controller('permissions')
@UseGuards(JwtAuthGuard)

export class PermissionsController {
  constructor(
    private readonly permissionsService: PermissionsService
  ) {}

  @Get()
  async findAll(): Promise<BaseResponse<any[]>> {
    return {
      message: "Permissions fetched successfully",
      data: await this.permissionsService.findAll(),
    }
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res, Req } from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { JwtAuthGuard } from '../auth/guards/logged-in.guard';
import { BaseResponse } from 'src/common/interface/base-interface.response';
import { Shipment } from '@prisma/client';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import {Response} from 'express'

@Controller('shipments')
@UseGuards(JwtAuthGuard)
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Post()
  @RequirePermissions('shipments.create')
  async create(@Body() createShipmentDto: CreateShipmentDto): Promise<BaseResponse<Shipment>> {
    return {
      message:'Shipment created successfully',
      data: await this.shipmentsService.create(createShipmentDto)
    }
  }

  @Get()
  async findAll(
    @Req() req: Request & {user?: any}
  ): Promise<BaseResponse<Shipment[]>> {
    return {
      message: 'Shipment retrivied successfully',
      data: await this.shipmentsService.findAll(req.user.id)
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<BaseResponse<Shipment>> {
    return {
      message: 'Shipment retrivied successfully',
      data: await this.shipmentsService.findOne(+id)
    }
  }

  @Get(':id/pdf')
  async generatePdf(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const pdfBuffer = await this.shipmentsService.generateShipmentPdf(+id)
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=*shipment-${id}.pdf`
    })
    res.send(pdfBuffer)
  }

  @Get('tracking/:trackingNumber')
  async findShipmentByTrackingNumber(
    @Param('trackingNumber') trackingNumber: string
  ): Promise<BaseResponse<Shipment>> {
    return {
      message: 'Shipment retrivied successfully',
      data: await this.shipmentsService.findShipmentByTrackingNumber(trackingNumber)
    }
  }
}

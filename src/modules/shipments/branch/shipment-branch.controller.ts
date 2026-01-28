import { BadRequestException, Body, Controller, Get, Param, Post, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { JwtAuthGuard } from "src/modules/auth/guards/logged-in.guard";
import { BaseResponse } from "src/common/interface/base-interface.response";
import { Shipment, ShipmentBranchLog } from "@prisma/client";
import { PermissionGuard } from "src/modules/auth/guards/permission.guard";
import { RequirePermissions } from "src/modules/auth/decorators/permissions.decorator";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { ShipmentBranchService } from "./shipment-branch.service";
import { ScanShipmentDto } from "../dto/scan-shipmment.dto";

@Controller('shipments/branch')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class ShipmentBranchController {
    constructor (
        private readonly shipmentBranchService: ShipmentBranchService
    ) {}

    @Get('logs')
    @RequirePermissions('shipment-branch.read')
    async findAll(
        @Req() req: Request & {user?: any}
    ): Promise<BaseResponse<ShipmentBranchLog[]>> {
        try {
            const user = req.user
            const logs = await this.shipmentBranchService.findAll(user)

            return {
                message: 'Shipment retrivied successfully',
                data: logs
            }
        } catch (error) {
            throw new BadRequestException(
                'Failed to retrivied shipment logs'
            )
        }
    }

    @Post('scan')
    async scanShipment(
        @Body() scanShipmentDto: ScanShipmentDto,
        @Req() req: Request & {user?: any}
    ): Promise<BaseResponse<ShipmentBranchLog>> {
        const user = req.user
        const shipment = await this.shipmentBranchService.scanShipment(
            scanShipmentDto,
            user.id
        )

        return {
            message: 'Shipment scanned successfully',
            data: shipment
        }
    }
}
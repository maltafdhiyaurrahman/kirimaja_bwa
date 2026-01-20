import { BadRequestException, Controller, Get, Param, Post, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { JwtAuthGuard } from "src/modules/auth/guards/logged-in.guard";
import { ShipmentCourierService } from "./shipment-courier.service";
import { BaseResponse } from "src/common/interface/base-interface.response";
import { Shipment } from "@prisma/client";
import { PermissionGuard } from "src/modules/auth/guards/permission.guard";
import { RequirePermissions } from "src/modules/auth/decorators/permissions.decorator";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";

@Controller('shipments/courier')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class ShipmentCourierController {
    constructor (
        private readonly shipmentCourierService: ShipmentCourierService
    ) {}

    @Get('list')
    @RequirePermissions('delivery.read')
    async findAll(): Promise<BaseResponse<Shipment[]>> {
        return {
            message: 'Shipment retrivied successfully',
            data: await this.shipmentCourierService.findAll()
        }
    }

    @Get('pick/:trackingNumber')
    @RequirePermissions('delivery.update')
    async pickShipment(
        @Param('trackingNumber') trackingNumber: string,
        @Req() req: Request & {user?: any}
    ): Promise<BaseResponse<Shipment>> {
        return {
            message: 'Shipment picked up successfully',
            data: await this.shipmentCourierService.pickShipment(trackingNumber, req.user.id)
        }
    }

    @Post('pickup/:trackingNumber') 
    @RequirePermissions('delivery.update')
    @UseInterceptors(
        FileInterceptor('photo', {
          storage: diskStorage({
            destination: './public/uploads/photos',
            filename: (req, file, cb) => {
              const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
              cb(null, uniqueSuffix + extname(file.originalname));
            }
          }),
          fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|avif)$/)) {
              return cb(new Error('Only image files are allowed!'), false);
            } cb(null, true); 
          }
        })
      )
    async pickupShipment(
        @Param('trackingNumber') trackingNumber: string,
        @Req() req: Request & {user?: any},
        @UploadedFile() pickupProofImage: Express.Multer.File | undefined
    ): Promise<BaseResponse<Shipment>> {
        if (!pickupProofImage) {
            throw new BadRequestException('Pickup proof image is required')
        }
        return {
            message: 'Shipment pickup confirmed successfully',
            data: await this.shipmentCourierService.pickupShipment(
                trackingNumber,
                req.user.id,
                pickupProofImage.filename
            )
        }
    }

    @Get('deliver-to-branch/:trackingNumber')
    @RequirePermissions('delivery.update')
    async deliverToBranch(
        @Param('trackingNumber') trackingNumber: string,
        @Req() req: Request & {user?: any}
    ): Promise<BaseResponse<Shipment>> {
        return {
            message: 'Shipment delivered to branch successfully',
            data: await this.shipmentCourierService.deliverToBranch(trackingNumber, req.user.id)
        }
    }

    @Get('pick-from-branch/:trackingNumber')
    @RequirePermissions('delivery.update')
    async pickShipmentFromBranch(
        @Param('trackingNumber') trackingNumber: string,
        @Req() req: Request & {user?: any}
    ): Promise<BaseResponse<Shipment>> {
        return {
            message: 'Shipment picked from branch successfully',
            data: await this.shipmentCourierService.pickShipmentFromBranch(trackingNumber, req.user.id)
        }
    }

    @Get('pickup-from-branch/:trackingNumber')
    @RequirePermissions('delivery.update')
    async pickupShipmentFromBranch(
        @Param('trackingNumber') trackingNumber: string,
        @Req() req: Request & {user?: any}
    ): Promise<BaseResponse<Shipment>> {
        return {
            message: 'Shipment picked up from branch successfully',
            data: await this.shipmentCourierService.pickupShipmentFromBranch(trackingNumber, req.user.id)
        }
    }

    @Post('deliver-to-customer/:trackingNumber') 
    @RequirePermissions('delivery.update')
    @UseInterceptors(
        FileInterceptor('photo', {
          storage: diskStorage({
            destination: './public/uploads/photos',
            filename: (req, file, cb) => {
              const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
              cb(null, uniqueSuffix + extname(file.originalname));
            }
          }),
          fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|avif)$/)) {
              return cb(new Error('Only image files are allowed!'), false);
            } cb(null, true); 
          }
        })
      )
    async deliverToCustomer(
        @Param('trackingNumber') trackingNumber: string,
        @Req() req: Request & {user?: any},
        @UploadedFile() receiptProofImage: Express.Multer.File | undefined
    ): Promise<BaseResponse<Shipment>> {
        if (!receiptProofImage) {
            throw new BadRequestException('Receipt proof image is required')
        }
        return {
            message: 'Shipment delivered to customer successfully',
            data: await this.shipmentCourierService.deliverToCustomer(
                trackingNumber,
                req.user.id,
                receiptProofImage.filename
            )
        }
    }
}
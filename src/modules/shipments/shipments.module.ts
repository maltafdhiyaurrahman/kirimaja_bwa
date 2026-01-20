import { Module } from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { ShipmentsController } from './shipments.controller';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { QueueModule } from 'src/common/queue/queue.module';
import { OpenCageService } from 'src/common/opencage/opencage.service';
import { XenditService } from 'src/common/xendit/xendit.service';
import { ShipmentWebhookController } from './webhook/shipments-webhook.controller';
import { QrCodeService } from 'src/common/qrcode/qrcode.service';
import { PdfService } from 'src/common/pdf/pdf.service';
import { ShipmentCourierController } from './courier/shipment-courier.controller';
import { PermissionsService } from '../permissions/permissions.service';
import { ShipmentCourierService } from './courier/shipment-courier.service';
import { ShipmentBranchController } from './branch/shipment-branch.controller';
import { ShipmentBranchService } from './branch/shipment-branch.service';

@Module({
  imports: [QueueModule],
  controllers: [
    ShipmentsController, 
    ShipmentWebhookController, 
    ShipmentCourierController,
    ShipmentBranchController
  ],
  providers: [
    ShipmentsService, 
    PrismaService, 
    OpenCageService, 
    XenditService, 
    QrCodeService, 
    PdfService, 
    PermissionsService, 
    ShipmentCourierService,
    ShipmentBranchService
  ],
})
export class ShipmentsModule {}

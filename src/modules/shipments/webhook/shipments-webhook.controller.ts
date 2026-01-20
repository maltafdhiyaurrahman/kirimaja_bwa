import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ShipmentsService } from "../shipments.service";
import { XenditWebhookDto } from "../dto/xendit-webhook.dto";

@Controller('shipments/webhook')
export class ShipmentWebhookController {
    constructor (
        private readonly shipmentsService: ShipmentsService
    ) {}

    @Post('xendit')
    @HttpCode(HttpStatus.OK)
    async handleXenditWebhook(
        @Body() webhookData: XenditWebhookDto
    ): Promise<{message: string}> {
        await this.shipmentsService.handlePaymentWebhook(webhookData)
        return {message: 'Webhook processed successfully'}
    }
}
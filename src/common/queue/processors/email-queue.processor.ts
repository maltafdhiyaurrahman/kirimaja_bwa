import { Process, Processor } from "@nestjs/bull";
import { Logger } from "@nestjs/common";
import { Job } from "bull";
import { error } from "console";
import { EmailService } from "src/common/email/email.service";

export interface EmailJobData {
    type: string;
    to: string;
    shipmentId?: number;
    amount?: number;
    paymentUrl?: string;
    expiryDate?: Date;
    trackingNumber? : string;
}

@Processor('email-queue')
export class EmailQueueProcessor {
    constructor (
        private readonly emailService: EmailService
    ) {}

    private readonly logger = new Logger(EmailQueueProcessor.name)

    @Process('send-email')
    async handleSendEmail(job: Job<EmailJobData>) {
        const {data} = job;
        this.logger.log(`Processing email job: ${data.type} to ${data.to}`)

        try {
            switch (data.type) {
                case 'testing':
                    await this.emailService.testEmail(data.to);
                    this.logger.log(`Test email to ${data.to}`);
                    break;
                case 'payment-notification':
                    const expiryDate = typeof data.expiryDate === 'string'
                                        ? new Date(data.expiryDate) : data.expiryDate
                    await this.emailService.sendEmailPaymentNotification(
                        data.to,
                        data.paymentUrl || '',
                        data.shipmentId || 0,
                        data.amount || 0,
                        expiryDate || new Date(),
                    )
                    this.logger.log(`Payment email sent to ${data.to}`)
                    break;
                case 'payment-success':
                    await this.emailService.sendPaymentSuccess(
                        data.to,
                        data.shipmentId || 0,
                        data.amount || 0,
                        data.trackingNumber
                    );

                    this.logger.log(`Payment success email sent to: ${data.to}`)
                    break;
                default: 
                    this.logger.log(`Unknown email type ${data.type}`);
                    break;
            }
        } catch {
            this.logger.error(`Failed to process email job: ${data.type} to ${data.to}`, error)
            throw error
        }
    }
} 
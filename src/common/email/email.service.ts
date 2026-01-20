import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer"
import * as path from "path";
import { Subject } from "rxjs";

@Injectable()
export class EmailService {
    private trasnporter: nodemailer.Transporter;
    private templatesPath: string;

    constructor () {
        this.trasnporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '2525', 10),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }

        });

        this.templatesPath = path.join('./src/common/email/templates')
    }

    private loadTemplate(templateName: string): string {
        const templatePath = path.join(
            this.templatesPath,
            `${templateName}.hbs`
        );

        return require('fs').readFileSync(templatePath, 'utf8')
    }

    private compileTemplate(templateName: string, data: any): string {
        const templateSource = this.loadTemplate(templateName);
        const template = require('handlebars').compile(templateSource);
        return template(data);
    }

    async testEmail(to: string): Promise<void> {
        const templateData = {
            title: 'Test Email',
            message: 'This is a test email for our application' 
        };

        const htmlContent = this.compileTemplate('test-email', templateData);

        const mailOptions = {
            from: process.env.SMTP_EMAIL_SENDER || 'kirimaja.altaf@gmail.com',
            to,
            subject: 'Test Email',
            html: htmlContent
        }

        await this.trasnporter.sendMail(mailOptions);
    }

    async sendEmailPaymentNotification(
        to: string,
        paymentUrl: string,
        shipmentId: number,
        amount: number,
        expiryDate: Date
    ): Promise<void> {
        const templateData = {
            shipmentId,
            paymentUrl,
            amount: amount.toLocaleString('id-ID'),
            expiryDate: expiryDate.toDateString()
        }

        const htmlContent = this.compileTemplate(
            'payment-notification',
            templateData
        )

        const mailOptions = {
            from: process.env.SMTP_EMAIL_SENDER || '',
            to,
            subject: `Payment Notification for Shipment #${shipmentId}`,
            html: htmlContent
        }

        await this.trasnporter.sendMail(mailOptions)
    }

    async sendPaymentSuccess(
        to: string,
        shipmentId: number,
        amount: number,
        trackingNumber?: string
    ): Promise<void> {
        const templateData = {
            shipmentId,
            amount: amount.toLocaleString('id-ID'),
            paymentDate: new Date().toLocaleDateString('id-ID'),
            trackingNumber
        }

        const html = this.compileTemplate('payment-success', templateData)

        const mailOptions = {
            from: process.env.SMTP_EMAIL_SENDER || '',
            to,
            subject: `Payment Successful - Shipment #${shipmentId}`,
            html
        }

        await this.trasnporter.sendMail(mailOptions)
    }
}
import { InjectQueue } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { Queue } from "bull";
import { EmailJobData } from "./processors/email-queue.processor";
import { PaymentExpiryJobData } from "./processors/payment-expired.processor";

@Injectable()
export class QueueService {
    constructor (
        @InjectQueue('email-queue') private emailQueue: Queue,
        @InjectQueue('payment-expired-queue') private paymentQueue: Queue
    ) {}

    async addEmailJob(data: EmailJobData, options?: {delay?: number, attempts?: number}) {
        return this.emailQueue.add('send-email', data, {
            delay: options?.delay || 0,
            attempts: options?.attempts || 3,
            removeOnComplete: true,
            removeOnFail: true,
            backoff: {
                type: 'exponential',
                delay: options?.delay || 1000
            }
        });
    }

    async addPaymentExpireJob(data: PaymentExpiryJobData, expiryDate: Date) {
        const delay = expiryDate.getTime() - Date.now()

        if (delay <= 0) {
            return this.paymentQueue.add('expiry-payment', data, {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 2000
                },
                removeOnComplete: 10,
                removeOnFail: 5,
            })
        }

        return this.paymentQueue.add('expire-payment', data, {
            delay,
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 2000
            },
            removeOnComplete: 10,
            removeOnFail: 5
        })
    }

    async cancelPaymnentExpiryJob(paymentId: number) {
        const jobs = await this.paymentQueue.getJobs(['delayed', 'waiting']);

        for (const job of jobs) {
            if (job.data.paymentId === paymentId) {
                await job.remove()
                break;
            }
        }
    }
} 
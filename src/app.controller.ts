import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './modules/auth/guards/logged-in.guard';
import { PermissionGuard } from './modules/auth/guards/permission.guard';
import { get } from 'http';
import { RequireAnyPermission, RequirePermissions } from './modules/auth/decorators/permissions.decorator';
import { EmailService } from './common/email/email.service';
import { QueueService } from './common/queue/queue.service';

@Controller()
// @UseGuards(JwtAuthGuard, PermissionGuard)

export class AppController {
  constructor(
    private readonly appService: AppService, 
    private readonly emailService: EmailService,
    private readonly queueService: QueueService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('protected')
  // @RequireAnyPermission('shipments.create')
  getProtectedResource(): string {
    return 'This is a protected route';
  }

  @Get('send-email-test')
  async sendEmailTest(): Promise<string> {
    await this.queueService.addEmailJob({
      to: 'testing@gmail.com',
      type: 'testing'
    })

    return 'Test email successfully'
  }
}

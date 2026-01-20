import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { PermissionsService } from '../permissions/permissions.service';

@Module({
  controllers: [RolesController],
  providers: [RolesService, PrismaService, PermissionsService],
})
export class RolesModule {}

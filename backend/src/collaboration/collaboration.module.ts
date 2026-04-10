import { Module } from '@nestjs/common';
import { CollaborationController } from './collaboration.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CollaborationController],
})
export class CollaborationModule {}

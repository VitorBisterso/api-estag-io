import { Module } from '@nestjs/common';
import { ProcessStepsController } from './process-steps.controller';
import { ProcessStepsService } from './process-steps.service';

@Module({
  controllers: [ProcessStepsController],
  providers: [ProcessStepsService],
})
export class ProcessStepsModule {}

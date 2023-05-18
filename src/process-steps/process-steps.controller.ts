import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard';
import { ProcessStepsService } from './process-steps.service';
import {
  CreateProcessStepDto,
  GetProcessStepsDto,
} from './dto';
import { GetUser } from 'src/auth/decorator';

@UseGuards(JwtGuard)
@ApiTags('process-steps')
@Controller('process-steps')
export class ProcessStepsController {
  constructor(
    private processStepsService: ProcessStepsService,
  ) {}

  @ApiOperation({
    summary:
      'Get all process steps from an opportunity',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Return all process steps from an opportunity',
    type: GetProcessStepsDto,
    isArray: true,
  })
  @Get('opportunity/:id')
  getProcessSteps(
    @Param('id', ParseIntPipe)
    opportunityId: number,
    @GetUser() user: Record<string, any>,
  ) {
    return this.processStepsService.getProcessSteps(
      opportunityId,
      user,
    );
  }

  @ApiOperation({
    summary: 'Create some process steps',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Created process steps',
    isArray: true,
    type: CreateProcessStepDto,
  })
  @Post('opportunity/:id')
  createProcessStep(
    @Param('id', ParseIntPipe)
    opportunityId: number,
    @Body()
    processSteps: Array<CreateProcessStepDto>,
    @GetUser() user: Record<string, any>,
  ) {
    return this.processStepsService.createProcessStep(
      opportunityId,
      processSteps,
      user,
    );
  }
}

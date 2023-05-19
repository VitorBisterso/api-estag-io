import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  Response,
  Put,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response as Res } from 'express';
import { JwtGuard } from 'src/auth/guard';
import { ProcessStepsService } from './process-steps.service';
import {
  CreateProcessStepDto,
  GetProcessStepsDto,
  UpdateProcessStepDto,
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

  @ApiOperation({
    summary: 'Update a process step',
  })
  @ApiBody({
    description:
      'The process step data to update (all properties are optional)',
    type: UpdateProcessStepDto,
    isArray: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Process step updated successfully',
    type: UpdateProcessStepDto,
    isArray: true,
  })
  @Put('opportunity/:id')
  updateOpportunity(
    @Param('id', ParseIntPipe)
    opportunityId: number,
    @Body()
    processSteps: Array<UpdateProcessStepDto>,
    @GetUser() user: Record<string, any>,
  ) {
    return this.processStepsService.updateProcessSteps(
      opportunityId,
      processSteps,
      user,
    );
  }

  @ApiOperation({
    summary: 'Delete a process steps',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description:
      'Process step deleted successfully',
  })
  @Delete(':id')
  deleteProcessStep(
    @Param('id', ParseIntPipe)
    processStepId: number,
    @GetUser() user: Record<string, any>,
    @Response() res: Res,
  ) {
    return this.processStepsService
      .deleteProcessStep(processStepId, user)
      .then(() =>
        res.sendStatus(HttpStatus.NO_CONTENT),
      );
  }
}

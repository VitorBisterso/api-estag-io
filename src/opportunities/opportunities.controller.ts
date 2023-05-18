import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Response,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard';
import {
  OpportunityDto,
  OpportunityFilterDto,
} from './dto';
import { OpportunitiesService } from './opportunities.service';
import { GetUser } from 'src/auth/decorator';
import { Response as Res } from 'express';
import { isUserACompany } from './helpers';

@UseGuards(JwtGuard)
@ApiTags('opportunities')
@Controller('opportunities')
export class OpportunitiesController {
  constructor(
    private opportunitiesService: OpportunitiesService,
  ) {}

  @ApiOperation({ summary: 'Get opportunities' })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Return all opportunities with pagination and the total in the content-range header',
    type: OpportunityDto,
    isArray: true,
  })
  @Get()
  getOpportunities(
    @Query() filter: OpportunityFilterDto,
    @GetUser() user: Record<string, any>,
    @Response() res: Res,
  ) {
    const isCompany = isUserACompany(user);
    return this.opportunitiesService
      .getOpportunities(
        filter,
        isCompany ? 'COMPANY' : 'USER',
        user.id,
      )
      .then((opportunities) =>
        res
          .set({
            'Content-Range': opportunities.length,
          })
          .json({ opportunities }),
      );
  }

  @ApiOperation({
    summary: 'Get opportunity by id',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return an opportunity by id',
    type: OpportunityDto,
  })
  @Get(':id')
  getOpportunityById(
    @Param('id', ParseIntPipe)
    opportunityId: number,
    @GetUser() user: Record<string, any>,
  ) {
    const isCompany = isUserACompany(user);
    return this.opportunitiesService.getOpportunityById(
      opportunityId,
      isCompany ? 'COMPANY' : 'USER',
      user.id,
    );
  }

  @ApiOperation({
    summary: 'Create an opportunity',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Created opportunity',
    type: OpportunityDto,
  })
  @Post()
  createOpportunity(
    @Body() opportunity: OpportunityDto,
    @GetUser() user: Record<string, any>,
  ) {
    return this.opportunitiesService.createOpportunity(
      opportunity,
      user,
    );
  }

  @ApiOperation({
    summary: 'Update an opportunity',
  })
  @ApiBody({
    description:
      'The opportunity data to update (all properties are optional)',
    type: OpportunityDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Opportunity updated successfully',
    type: OpportunityDto,
  })
  @Put(':id')
  updateOpportunity(
    @Param('id', ParseIntPipe)
    opportunityId: number,
    @Body() opportunity: Partial<OpportunityDto>,
    @GetUser() user: Record<string, any>,
  ) {
    return this.opportunitiesService.updateOpportunity(
      opportunityId,
      opportunity,
      user,
    );
  }

  @ApiOperation({
    summary: 'Delete an opportunity',
  })
  @Delete(':id')
  deleteOpportunity(
    @Param('id', ParseIntPipe)
    opportunityId: number,
    @GetUser() user: Record<string, any>,
  ) {
    return this.opportunitiesService.deleteOpportunity(
      opportunityId,
      user,
    );
  }

  @ApiOperation({
    summary:
      'Apply for an opportunity as a student',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Applied successfully',
  })
  @Patch('apply/:id')
  applyForOpportunity(
    @Param('id', ParseIntPipe)
    opportunityId: number,
    @GetUser() user: Record<string, any>,
    @Response() res: Res,
  ) {
    return this.opportunitiesService
      .applyForOpportunity(opportunityId, user)
      .then(() =>
        res.sendStatus(HttpStatus.NO_CONTENT),
      );
  }
}

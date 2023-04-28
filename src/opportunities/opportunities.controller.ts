import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Response,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
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
  @ApiOkResponse({
    description:
      'Return all opportunities with pagination and the total in the content-range header',
    type: Array<OpportunityDto>,
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
    summary: 'Create an opportunity',
  })
  @ApiCreatedResponse({
    description: 'Create an opportunity',
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
}

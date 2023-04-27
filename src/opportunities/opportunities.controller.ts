import {
  Controller,
  Get,
  Query,
  Response,
  UseGuards,
} from '@nestjs/common';
import {
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
  getOpportunitiesAsCompany(
    @Query() filter: OpportunityFilterDto,
    @GetUser() user: Record<string, any>,
    @Response() res: Res,
  ) {
    const isCompany = !!user.cnpj;
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
}

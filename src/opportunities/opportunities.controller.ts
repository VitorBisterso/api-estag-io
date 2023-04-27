import {
  Controller,
  Get,
  Query,
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
      'Return all opportunies with pagination and the total in the content-range header',
    type: Array<OpportunityDto>,
  })
  @Get()
  getOpportunitiesAsCompany(
    @Query() filter: OpportunityFilterDto,
    @GetUser() user: Record<string, any>,
  ) {
    return this.opportunitiesService.getOpportunities(
      filter,
      user.cnpj ? 'COMPANY' : 'USER',
    );
  }
}

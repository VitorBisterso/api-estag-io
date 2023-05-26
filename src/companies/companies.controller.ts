import {
  Controller,
  Get,
  HttpStatus,
  Query,
  Response,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard';
import { CompaniesService } from './companies.service';
import { AuthCompanyDto } from 'src/auth/dto';
import { GetUser } from 'src/auth/decorator';
import { Response as Res } from 'express';
import { CompanyFilterDto } from './dto';

@UseGuards(JwtGuard)
@ApiTags('companies')
@Controller('companies')
export class CompaniesController {
  constructor(
    private companiesService: CompaniesService,
  ) {}

  @ApiOperation({ summary: 'Get opportunities' })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Return all companies with pagination and the total in the content-range header',
    type: AuthCompanyDto,
    isArray: true,
  })
  @Get()
  getCompanies(
    @Query() filter: CompanyFilterDto,
    @GetUser() user: Record<string, any>,
    @Response() res: Res,
  ) {
    return this.companiesService
      .getCompanies(filter, user)
      .then((companies) =>
        res
          .set({
            'Content-Range': companies.length,
          })
          .json({ companies }),
      );
  }
}

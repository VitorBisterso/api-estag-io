import {
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
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
import { isUserACompany } from 'src/opportunities/helpers';

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
      .then(({ companies, count }) =>
        res
          .set({
            'Content-Range': count,
          })
          .json({ companies }),
      );
  }

  @ApiOperation({
    summary: 'Get company by id',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return a company by id',
    type: AuthCompanyDto,
  })
  @Get(':id')
  getCompanyById(
    @Param('id', ParseIntPipe)
    companyId: number,
    @GetUser() user: Record<string, any>,
  ) {
    const isCompany = isUserACompany(user);
    return this.companiesService.getCompanyById(
      companyId,
      isCompany ? 'COMPANY' : 'USER',
    );
  }
}

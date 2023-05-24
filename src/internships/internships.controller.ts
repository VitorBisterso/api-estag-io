import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
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
import { Response as Res } from 'express';
import { InternshipsService } from './internships.service';
import { GetUser } from 'src/auth/decorator';
import {
  CreateInternshipDto,
  InternshipDto,
  InternshipFilterDto,
} from './dto';

@UseGuards(JwtGuard)
@ApiTags('internships')
@Controller('internships')
export class InternshipsController {
  constructor(
    private internshipsService: InternshipsService,
  ) {}

  @ApiOperation({ summary: 'Get internships' })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Return all internships with pagination and the total in the content-range header',
    type: InternshipDto,
    isArray: true,
  })
  @Get()
  getInternships(
    @Query() filter: InternshipFilterDto,
    @GetUser() user: Record<string, any>,
    @Response() res: Res,
  ) {
    return this.internshipsService
      .getInternships(user, filter)
      .then((internships) =>
        res
          .set({
            'Content-Range': internships.length,
          })
          .json({ internships }),
      );
  }

  @ApiOperation({
    summary: 'Get internship by id',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return an internship by id',
    type: InternshipDto,
  })
  @Get(':id')
  getInternshipById(
    @Param('id', ParseIntPipe)
    internshipId: number,
    @GetUser() user: Record<string, any>,
  ) {
    return this.internshipsService.getInternshipById(
      internshipId,
      user,
    );
  }

  @ApiOperation({
    summary: 'Create an internship',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Created internship',
    type: InternshipDto,
  })
  @Post()
  createInternship(
    @Body() internship: CreateInternshipDto,
    @GetUser() user: Record<string, any>,
  ) {
    return this.internshipsService.createInternship(
      internship,
      user,
    );
  }
}

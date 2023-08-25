import {
  Controller,
  Get,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BusinessCategoriesService } from './business-categories.service';
import { BusinessCategoryDto } from './dto';

@ApiTags('business-categories')
@Controller('business-categories')
export class BusinessCategoriesController {
  constructor(
    private businessCategoriesService: BusinessCategoriesService,
  ) {}

  @ApiOperation({
    summary: 'Get available business categories',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return the business categories',
    type: BusinessCategoryDto,
    isArray: true,
  })
  @Get()
  getBusinessCategories() {
    return this.businessCategoriesService.getBusinessCategories();
  }
}

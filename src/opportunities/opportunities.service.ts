import { Injectable } from '@nestjs/common';
import { USER_TYPE } from 'src/auth/dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { OpportunityFilterDto } from './dto';

@Injectable()
export class OpportunitiesService {
  constructor(private prisma: PrismaService) {}

  async getOpportunities(
    filter: OpportunityFilterDto,
    userType: USER_TYPE,
  ) {}
}

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateInternshipDto,
  InternshipFilterDto,
} from './dto';
import {
  isDeadlineValid,
  isUserACompany,
} from 'src/opportunities/helpers';
import { areInternshipsDatesValid } from './helpers';

@Injectable()
export class InternshipsService {
  constructor(private prisma: PrismaService) {}

  async getInternships(
    user: Record<string, any>,
    filter: InternshipFilterDto,
  ) {
    if (!isUserACompany(user))
      throw new ForbiddenException(
        'You cannot perform this operation',
      );

    const {
      page,
      size,
      orderBy,
      direction,
      internName,
      type,
      weeklyWorkload,
    } = filter;

    const orderByCriteria =
      !orderBy || orderBy === 'student'
        ? {
            student: {
              name: direction,
            },
          }
        : {
            [orderBy]: direction,
          };

    return await this.prisma.internship.findMany({
      skip: (page - 1) * size,
      take: size,
      where: {
        student: {
          name: {
            contains: internName,
          },
        },
        job: {
          type: {
            equals: type,
          },
          weeklyWorkload: {
            equals: weeklyWorkload,
          },
        },
      },
      orderBy: orderByCriteria,
      include: {
        student: true,
        job: true,
      },
    });
  }

  async getInternshipById(
    internshipId: number,
    user: Record<string, any>,
  ) {
    if (!isUserACompany(user))
      throw new ForbiddenException(
        'You cannot perform this operation',
      );

    const internship =
      await this.prisma.internship.findUnique({
        where: {
          id: internshipId,
        },
        include: {
          student: true,
          job: true,
        },
      });

    if (!internship)
      throw new NotFoundException(
        `Internship with id ${internshipId} not found`,
      );

    const opportunity =
      await this.prisma.opportunity.findUnique({
        where: {
          id: internship.jobId,
        },
      });

    if (
      !opportunity ||
      opportunity.companyId !== user.id
    )
      throw new NotFoundException(
        `Internship with id ${internshipId} not found`,
      );

    return internship;
  }

  async createInternship(
    internship: CreateInternshipDto,
    user: Record<string, any>,
  ) {
    if (!isUserACompany(user))
      throw new ForbiddenException(
        'You cannot perform this operation',
      );

    if (!isDeadlineValid(internship.until))
      throw new BadRequestException(
        'The until date must be a date in the future',
      );

    if (
      !areInternshipsDatesValid(
        internship.initialDate,
        internship.until,
      )
    )
      throw new BadRequestException(
        'The initial date must be before the until date',
      );

    const existentInternship =
      await this.prisma.internship.findUnique({
        where: {
          studentId: internship.studentId,
        },
      });

    if (existentInternship)
      throw new BadRequestException(
        'There is already an internship with this student',
      );

    const student =
      await this.prisma.user.findUnique({
        where: {
          id: internship.studentId,
        },
      });

    if (!student)
      throw new NotFoundException(
        `Student with id ${internship.studentId} was not found`,
      );

    const opportunity =
      await this.prisma.opportunity.findUnique({
        where: {
          id: internship.jobId,
        },
        include: {
          applicants: true,
        },
      });

    if (!opportunity)
      throw new NotFoundException(
        `Opportunity with id ${internship.jobId} was not found`,
      );

    const isStudentApplied =
      !opportunity.applicants.some(
        (applicant) =>
          applicant.userId === student.id,
      );
    if (!isStudentApplied)
      throw new UnprocessableEntityException(
        `Student with id ${internship.studentId} not applied to opportunity with id ${internship.jobId}`,
      );
    0;

    const createdInternship =
      await this.prisma.internship.create({
        data: {
          ...internship,
          initialDate: new Date(
            internship.initialDate,
          ),
          until: new Date(internship.until),
          studentId: student.id,
          jobId: opportunity.id,
        },
      });

    return createdInternship;
  }
}

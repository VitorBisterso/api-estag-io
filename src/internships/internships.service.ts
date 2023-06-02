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
  UpdateInternshipDto,
} from './dto';
import {
  isDeadlineValid,
  isUserACompany,
} from 'src/opportunities/helpers';
import { areInternshipsDatesValid } from './helpers';
import { Prisma } from '@prisma/client';

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

  async getMyInternship(
    user: Record<string, any>,
  ) {
    if (isUserACompany(user))
      throw new ForbiddenException(
        'You cannot perform this operation',
      );

    const internship =
      await this.prisma.internship.findUnique({
        where: {
          studentId: user.id,
        },
        include: {
          job: true,
        },
      });

    if (!internship) return {};

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
      opportunity.applicants.some(
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

  async updateInternship(
    internshipId: number,
    internship: Partial<UpdateInternshipDto>,
    user: Record<string, any>,
  ) {
    const existentInternship =
      await this.prisma.internship.findUnique({
        where: {
          id: internshipId,
        },
      });

    if (!existentInternship)
      throw new BadRequestException(
        `Internship with id ${internshipId} not found`,
      );

    if (!isUserACompany(user))
      throw new ForbiddenException(
        'You cannot perform this operation',
      );

    if (
      internship.until &&
      !isDeadlineValid(internship.until)
    )
      throw new BadRequestException(
        'The until date must be a date in the future',
      );

    if (
      !areInternshipsDatesValid(
        internship.initialDate ??
          existentInternship.initialDate.toDateString(),
        internship.until ??
          existentInternship.until.toDateString(),
      )
    )
      throw new BadRequestException(
        'The initial date must be before the until date',
      );

    let opportunity;
    if (internship.jobId) {
      opportunity =
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
    } else {
      opportunity =
        await this.prisma.opportunity.findUnique({
          where: {
            id: existentInternship.jobId,
          },
          include: {
            applicants: true,
          },
        });
    }

    delete internship.jobId;
    return this.prisma.internship.update({
      data: {
        ...internship,
        initialDate: internship.initialDate
          ? new Date(internship.initialDate)
          : existentInternship.initialDate,
        until: internship.until
          ? new Date(internship.until)
          : existentInternship.until,
        jobId: opportunity.id,
      },
      where: {
        id: internshipId,
      },
    });
  }

  async deleteInternship(
    id: number,
    user: Record<string, any>,
  ) {
    const isCompany = isUserACompany(user);

    if (!isCompany)
      throw new ForbiddenException(
        'Only companies can delete an internship',
      );

    try {
      await this.prisma.internship.findUniqueOrThrow(
        {
          where: {
            id,
          },
        },
      );
    } catch (error) {
      if (
        error instanceof
        Prisma.PrismaClientKnownRequestError
      ) {
        console.log('err', error);
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `Internship with id ${id} not found`,
          );
        }
      }
      throw error;
    }

    return this.prisma.internship.delete({
      where: {
        id,
      },
    });
  }
}

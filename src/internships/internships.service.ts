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
import {
  getDeadlineDateMessage,
  getForbiddenMessage,
  getInitialDateMessage,
  getNotFoundMessage,
} from 'src/utils/messages';

@Injectable()
export class InternshipsService {
  constructor(private prisma: PrismaService) {}

  async getInternships(
    user: Record<string, any>,
    filter: InternshipFilterDto,
  ) {
    if (!isUserACompany(user))
      throw new ForbiddenException(
        getForbiddenMessage(),
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
        getForbiddenMessage(),
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
        getNotFoundMessage(
          'Estágio',
          internshipId.toString(),
        ),
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
        getNotFoundMessage(
          'Estágio',
          internshipId.toString(),
        ),
      );

    return internship;
  }

  async getMyInternship(
    user: Record<string, any>,
  ) {
    if (isUserACompany(user))
      throw new ForbiddenException(
        getForbiddenMessage(),
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
        getForbiddenMessage(),
      );

    if (!isDeadlineValid(internship.until))
      throw new BadRequestException(
        getDeadlineDateMessage(),
      );

    if (
      !areInternshipsDatesValid(
        internship.initialDate,
        internship.until,
      )
    )
      throw new BadRequestException(
        getInitialDateMessage(),
      );

    const existentInternship =
      await this.prisma.internship.findUnique({
        where: {
          studentId: internship.studentId,
        },
      });

    if (existentInternship)
      throw new BadRequestException(
        'Já existe um estágio cadastrado para esse estudante',
      );

    const student =
      await this.prisma.user.findUnique({
        where: {
          id: internship.studentId,
        },
      });

    if (!student)
      throw new NotFoundException(
        getNotFoundMessage(
          'Estudante',
          internship.studentId.toString(),
        ),
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
        getNotFoundMessage(
          'Vaga',
          internship.jobId.toString(),
        ),
      );

    const isStudentApplied =
      opportunity.applicants.some(
        (applicant) =>
          applicant.userId === student.id,
      );
    if (!isStudentApplied)
      throw new UnprocessableEntityException(
        `Estudante com id "${internship.studentId}" não está aplicado a vaga de id "${internship.jobId}"`,
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
      throw new NotFoundException(
        getNotFoundMessage(
          'Estágio',
          internshipId.toString(),
        ),
      );

    if (!isUserACompany(user))
      throw new ForbiddenException(
        getForbiddenMessage(),
      );

    if (
      internship.until &&
      !isDeadlineValid(internship.until)
    )
      throw new BadRequestException(
        getDeadlineDateMessage(),
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
        getInitialDateMessage(),
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
          getNotFoundMessage(
            'Vaga',
            internship.jobId.toString(),
          ),
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
        getForbiddenMessage(),
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
            getNotFoundMessage(
              'Vaga',
              id.toString(),
            ),
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

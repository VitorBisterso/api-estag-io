import { OpportunityType } from '@prisma/client';

export function isUserACompany(
  user: Record<string, any>,
) {
  return !!user.cnpj;
}

export function isTypeValid(
  type: OpportunityType,
) {
  return type === 'LOCAL' || type === 'REMOTE';
}

export function isDeadlineValid(
  deadline: string,
) {
  const deadlineDate = new Date(deadline);
  return (
    deadlineDate.getTime() > new Date().getTime()
  );
}

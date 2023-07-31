export function getRequiredMessage(
  field: string,
) {
  return `O campo "${field}" é obrigatório`;
}

export function getStringMessage(field: string) {
  return `O campo "${field}" deve ser uma string`;
}

export function getDateStringMessage(
  field: string,
) {
  return `O campo "${field}" deve ser uma string no formato "YYYY-MM-DD"`;
}

export function getForbiddenMessage() {
  return 'Você não tem permissão para isso';
}

export function getNotFoundMessage(
  object: string,
  key?: string,
  value?: string | number,
) {
  if (key)
    return `${object} com o ${key} ${value} não foi encontrado`;

  return `${object} não foi encontrado`;
}

export function getDeadlineDateMessage() {
  return 'A data limite deve ser uma data no futuro';
}

export function getInitialDateMessage() {
  return 'A data inicial deve ser antes da final';
}

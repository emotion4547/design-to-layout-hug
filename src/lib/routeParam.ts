/** Похоже ли значение из адреса на UUID, а не на человекочитаемый слаг. */
export const isUuid = (v: string | undefined): boolean =>
  !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

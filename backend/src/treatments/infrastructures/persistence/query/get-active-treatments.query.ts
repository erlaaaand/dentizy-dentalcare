// backend/src/treatments/infrastructures/persistence/queries/get-active-treatments.query.ts
export class GetActiveTreatmentsQuery {
  constructor(
    public readonly categoryId?: number,
    public readonly limit?: number,
  ) {}
}

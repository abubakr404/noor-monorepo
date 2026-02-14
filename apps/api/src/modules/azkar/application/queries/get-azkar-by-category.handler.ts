import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetAzkarByCategoryQuery } from "./get-azkar-by-category.query";
import { AzkarDataService } from "../services/azkar-data.service";
import type { ZikrEntity } from "../../domain/entities/zikr.entity";

@QueryHandler(GetAzkarByCategoryQuery)
export class GetAzkarByCategoryHandler implements IQueryHandler<GetAzkarByCategoryQuery> {
  constructor(private readonly azkarData: AzkarDataService) {}

  async execute(query: GetAzkarByCategoryQuery): Promise<ZikrEntity[]> {
    if (!query.category) {
      return this.azkarData.getAll();
    }
    return this.azkarData.getByCategory(query.category);
  }
}

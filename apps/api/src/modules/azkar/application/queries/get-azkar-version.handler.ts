import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetAzkarVersionQuery } from "./get-azkar-version.query";
import { AzkarDataService } from "../services/azkar-data.service";

@QueryHandler(GetAzkarVersionQuery)
export class GetAzkarVersionHandler implements IQueryHandler<GetAzkarVersionQuery> {
  constructor(private readonly azkarData: AzkarDataService) {}

  async execute(): Promise<{ version: number }> {
    const record = await this.azkarData.getContentVersion("azkar");
    return { version: record?.version ?? 0 };
  }
}

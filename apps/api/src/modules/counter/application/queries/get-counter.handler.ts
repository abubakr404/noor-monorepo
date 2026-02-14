import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetCounterQuery } from "./get-counter.query";
import { CounterDataService } from "../services/counter-data.service";

interface CounterResponse {
  current: number;
  target: number;
  presetId: string | null;
  customLabel: string | null;
}

@QueryHandler(GetCounterQuery)
export class GetCounterHandler implements IQueryHandler<GetCounterQuery> {
  constructor(private readonly counterData: CounterDataService) {}

  async execute(query: GetCounterQuery): Promise<CounterResponse> {
    const state = await this.counterData.getByUserId(query.userId);

    if (!state) {
      return {
        current: 0,
        target: 33,
        presetId: null,
        customLabel: null,
      };
    }

    return {
      current: state.current,
      target: state.target,
      presetId: state.presetId,
      customLabel: state.customLabel,
    };
  }
}

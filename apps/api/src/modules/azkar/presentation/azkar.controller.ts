import { Controller, Get, Query as QueryParam } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { GetAzkarByCategoryQuery } from "../application/queries/get-azkar-by-category.query";
import { GetAzkarVersionQuery } from "../application/queries/get-azkar-version.query";
import { GetCounterPresetsQuery } from "../application/queries/get-counter-presets.query";

@Controller("azkar")
export class AzkarController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  getByCategory(@QueryParam("category") category?: string) {
    return this.queryBus.execute(
      new GetAzkarByCategoryQuery(category ?? null),
    );
  }

  @Get("version")
  getVersion() {
    return this.queryBus.execute(new GetAzkarVersionQuery());
  }

  @Get("all")
  getAll() {
    return this.queryBus.execute(new GetAzkarByCategoryQuery(null));
  }
}

@Controller("counter-presets")
export class CounterPresetsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  getAll() {
    return this.queryBus.execute(new GetCounterPresetsQuery());
  }
}

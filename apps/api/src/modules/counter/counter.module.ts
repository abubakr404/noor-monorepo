import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { CounterController } from "./presentation/counter.controller";
import { CounterDataService } from "./application/services/counter-data.service";
import { CounterRepository } from "./infrastructure/repositories/counter.repository";
import { COUNTER_REPOSITORY } from "./domain/interfaces/counter-repository.token";
import { SaveCounterHandler } from "./application/commands/save-counter.handler";
import { GetCounterHandler } from "./application/queries/get-counter.handler";

const CommandHandlers = [SaveCounterHandler];
const QueryHandlers = [GetCounterHandler];

@Module({
  imports: [CqrsModule],
  controllers: [CounterController],
  providers: [
    CounterRepository,
    { provide: COUNTER_REPOSITORY, useExisting: CounterRepository },
    CounterDataService,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [CounterDataService],
})
export class CounterModule {}

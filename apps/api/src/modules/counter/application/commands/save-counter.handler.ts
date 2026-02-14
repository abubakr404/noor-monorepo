import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { SaveCounterCommand } from "./save-counter.command";
import { CounterDataService } from "../services/counter-data.service";
import type { CounterStateEntity } from "../../domain/entities/counter-state.entity";

@CommandHandler(SaveCounterCommand)
export class SaveCounterHandler
  implements ICommandHandler<SaveCounterCommand>
{
  constructor(private readonly counterData: CounterDataService) {}

  async execute(command: SaveCounterCommand): Promise<CounterStateEntity> {
    return this.counterData.saveState(
      command.userId,
      command.current,
      command.target,
      command.presetId,
      command.customLabel,
    );
  }
}

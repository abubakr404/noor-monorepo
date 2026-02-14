import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { PreferencesController } from "./presentation/preferences.controller";
import { PreferencesDataService } from "./application/services/preferences-data.service";
import { PreferencesRepository } from "./infrastructure/repositories/preferences.repository";
import { PREFERENCES_REPOSITORY } from "./domain/interfaces/preferences-repository.token";
import { UpdatePreferencesHandler } from "./application/commands/update-preferences.handler";
import { GetPreferencesHandler } from "./application/queries/get-preferences.handler";

const CommandHandlers = [UpdatePreferencesHandler];
const QueryHandlers = [GetPreferencesHandler];

@Module({
  imports: [CqrsModule],
  controllers: [PreferencesController],
  providers: [
    PreferencesRepository,
    { provide: PREFERENCES_REPOSITORY, useExisting: PreferencesRepository },
    PreferencesDataService,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [PreferencesDataService],
})
export class PreferencesModule {}

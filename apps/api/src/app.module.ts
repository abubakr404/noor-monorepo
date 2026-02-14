import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { AzkarModule } from "./modules/azkar/azkar.module";
import { ProgressModule } from "./modules/progress/progress.module";
import { CounterModule } from "./modules/counter/counter.module";
import { FavoritesModule } from "./modules/favorites/favorites.module";
import { PreferencesModule } from "./modules/preferences/preferences.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    AzkarModule,
    ProgressModule,
    CounterModule,
    FavoritesModule,
    PreferencesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { IsString, IsBoolean, IsOptional } from "class-validator";

export class UpdatePreferencesDto {
  @IsString()
  @IsOptional()
  language?: string;

  @IsString()
  @IsOptional()
  theme?: string;

  @IsString()
  @IsOptional()
  counterMode?: string;

  @IsBoolean()
  @IsOptional()
  soundEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  vibrationEnabled?: boolean;
}

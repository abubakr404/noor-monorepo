import { IsNumber, IsString, IsOptional } from "class-validator";

export class SaveCounterDto {
  @IsNumber()
  current!: number;

  @IsNumber()
  target!: number;

  @IsString()
  @IsOptional()
  presetId?: string;

  @IsString()
  @IsOptional()
  customLabel?: string;
}

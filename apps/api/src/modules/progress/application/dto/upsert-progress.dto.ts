import { IsString, IsArray, IsObject } from "class-validator";

export class UpsertProgressDto {
  @IsString()
  date!: string;

  @IsString()
  category!: string;

  @IsArray()
  completedIds!: number[];

  @IsObject()
  inProgress!: Record<string, number>;
}

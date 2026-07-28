import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator'

export class CreateConcertDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  description: string

  @IsInt()
  @Min(1)
  @Max(500)
  totalSeats: number
}

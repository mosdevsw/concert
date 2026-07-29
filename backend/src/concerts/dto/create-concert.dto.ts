import { IsInt, IsNotEmpty, IsString, Max, MaxLength, Min } from 'class-validator'

export class CreateConcertDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  name: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(1500)
  description: string

  @IsInt()
  @Min(1)
  @Max(500)
  totalSeats: number
}

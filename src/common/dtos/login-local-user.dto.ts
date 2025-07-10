import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export default class loginLocalUserDto {
  @IsEmail()
  email: string;
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;
}

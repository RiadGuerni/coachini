import {
  IsEmail,
  IsEnum,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from '../enums/role.enum';

export default class CreateLocalUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;
  @IsEnum(Role)
  role: Role;
  @IsEmail()
  email: string;
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;
  userId: string | null;
}

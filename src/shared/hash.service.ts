import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
@Injectable()
export class HashService {
  private readonly saltRounds = 10;
  async hashPassword(password: string) {
    try {
      return await bcrypt.hash(password, this.saltRounds);
    } catch (error) {
      console.error('Error hashing password:', error);
      throw new InternalServerErrorException('Password hashing failed');
    }
  }
  async comparePassword(password: string, hashedPassword: string) {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (err) {
      console.error('Error comparing password:', err);
      throw new InternalServerErrorException('Password comparison failed');
    }
  }
}

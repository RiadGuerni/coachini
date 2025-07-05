import { Controller } from '@nestjs/common';
import { CoachService } from './coach.service';

@Controller('coach')
export class CoachController {
  constructor(private readonly coachService: CoachService) {}
}

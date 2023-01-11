import { Controller, Get } from '@nestjs/common';

import { Auth } from 'src/auth/decorators';
import { validRoles } from 'src/auth/interfaces';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  @Auth(validRoles.admin)
  executeSeed() {
    return this.seedService.executeSeed();
  }
}

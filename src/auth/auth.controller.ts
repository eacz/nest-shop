import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { RawHeaders } from 'src/common/decorators';
import { AuthService } from './auth.service';
import { GetUser } from './decorators/get-user.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { User } from './entities/auth.entity';
import { UserRoleGuard } from './guards/user-role-guard/user-role-guard.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get()
  @UseGuards(AuthGuard())
  testPrivateRoute(
    @GetUser() user: User,
    @RawHeaders() rawHeaders: string[],
    //@GetUser('email') userEmail: string,
    //@GetUser(['email', 'fullName']) userProperties: string[],
    //@GetUser(['email', 'fullName', 'pedro']) userProperties2: string[],
  ) {
    return { user, rawHeaders };
  }

  @Get('private2')
  @SetMetadata('roles', ['admin', 'super-user'])
  @UseGuards(AuthGuard(), UserRoleGuard)
  testPrivateRoute2(@GetUser() user: User) {
    return { user };
  }
}

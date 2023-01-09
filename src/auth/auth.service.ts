import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { QueryFailedError, Repository } from 'typeorm';
import { DatabaseError } from 'pg';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/auth.entity';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}
  private readonly logger = new Logger('Auth');

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      await this.userRepository.save(user);
      delete user.password;
      //TODO return JWT
      return { user, token: this.generateJwt({ id: user.id }) };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const { email, password } = loginDto;
      const user = await this.userRepository.findOne({
        where: { email },
        select: { email: true, password: true, id: true },
      });

      if (!user) {
        throw new UnauthorizedException(`Invalid Credentials`);
      }

      if (!bcrypt.compareSync(password, user.password)) {
        throw new UnauthorizedException(`Invalid Credentials`);
      }

      return { token: this.generateJwt({ id: user.id }) };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  private generateJwt(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  private handleDBExceptions(error: any): never {
    this.logger.error(error);

    if (error instanceof QueryFailedError) {
      const errorData = error.driverError as DatabaseError;
      //duplicated error
      if (errorData.code === '23505') {
        throw new BadRequestException(errorData.detail);
      }
      //id error
      if (errorData.code === '22P02') {
        throw new BadRequestException(`Invalid uuid`);
      }
    }
    throw error;
  }
}

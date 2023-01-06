import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { DatabaseError } from 'pg';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/auth.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
      return user;
    } catch (error) {
      this.handleDBExceptions(error);
    }
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

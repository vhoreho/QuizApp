import { Controller, Post, Body, UseGuards, Request, Get, Res, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) { }

  @Post('login')
  async login(
    @Body() loginData: { username: string; password: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.validateUser(loginData.username, loginData.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { access_token, user: userResponse } = await this.authService.login(user);

    // Set JWT token in HTTP-only cookie
    response.cookie('access_token', access_token, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    return { user: userResponse };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token');
    return { success: true };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto, @Request() req) {
    return this.authService.createUser(createUserDto, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Get('check')
  @UseGuards(JwtAuthGuard)
  async checkAuth(@Request() req) {
    return {
      isAuthenticated: true,
      user: req.user
    };
  }
}

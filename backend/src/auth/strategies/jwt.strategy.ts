import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'super-secret',
    });
  }

  async validate(payload: any) {
    this.logger.debug(`JWT Payload: ${JSON.stringify(payload)}`);

    // Make sure we have a valid user ID
    if (!payload.sub) {
      this.logger.error('JWT payload missing subject (user ID)');
    }

    return {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
    };
  }
}

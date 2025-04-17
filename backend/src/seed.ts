import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';
import { UserRole } from './users/entities/user.entity';
import { UsersService } from './users/users.service';

async function bootstrap() {
  const logger = new Logger('Seed');

  try {
    logger.log('Starting the seeding process...');

    // Create the NestJS application
    const app = await NestFactory.createApplicationContext(AppModule);

    // Get the required services
    const authService = app.get(AuthService);
    const usersService = app.get(UsersService);

    // Check if admin already exists
    try {
      const existingAdmin = await usersService.findByUsername('admin');
      if (existingAdmin) {
        logger.log('Admin user already exists, skipping creation');
        await app.close();
        return;
      }
    } catch (error) {
      // User not found, continue with creation
    }

    // Create the admin user
    const adminUser = {
      username: 'admin',
      password: 'admin123',  // This will be hashed by the auth service
      email: 'admin@quizapp.com',
      name: 'Administrator',
      role: UserRole.ADMIN
    };

    // We need to hash the password before saving
    const hashedPassword = await authService.hashPassword(adminUser.password);

    // Create the admin user using the users service directly
    // to bypass the "only admins can create users" restriction
    await usersService.create({
      ...adminUser,
      password: hashedPassword
    });

    logger.log('Admin user created successfully!');
    logger.log('Username: admin');
    logger.log('Password: admin123');

    await app.close();

  } catch (error) {
    logger.error('Error during seeding process');
    logger.error(error);
    process.exit(1);
  }
}

bootstrap(); 
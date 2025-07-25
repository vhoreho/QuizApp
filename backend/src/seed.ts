import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';
import { UserRole } from './users/entities/user.entity';
import { UsersService } from './users/users.service';

async function bootstrap() {
  const logger = new Logger('Seed');

  try {
    logger.log('=== Starting the seeding process ===');
    logger.log('Creating NestJS application context...');

    // Create the NestJS application
    const app = await NestFactory.createApplicationContext(AppModule);
    logger.log('Application context created successfully');

    // Get the required services
    logger.log('Getting required services...');
    const authService = app.get(AuthService);
    const usersService = app.get(UsersService);
    logger.log('Services initialized successfully');

    // Check if admin already exists
    logger.log('Checking if admin user already exists...');
    try {
      const existingAdmin = await usersService.findByUsername('admin');
      if (existingAdmin) {
        logger.log('Admin user already exists, skipping creation');
        logger.log('=== Seeding process completed ===');
        await app.close();
        return;
      }
    } catch (error) {
      logger.log('Admin user not found, proceeding with creation');
    }

    // Create the admin user
    const adminUser = {
      username: 'admin',
      password: 'admin123', // This will be hashed by the auth service
      email: 'admin@quizapp.com',
      name: 'Administrator',
      role: UserRole.ADMIN,
    };

    logger.log('Hashing password for admin user...');
    // We need to hash the password before saving
    const hashedPassword = await authService.hashPassword(adminUser.password);
    logger.log('Password hashed successfully');

    logger.log('Creating admin user...');
    // Create the admin user using the users service directly
    // to bypass the "only admins can create users" restriction
    await usersService.create({
      ...adminUser,
      password: hashedPassword,
    });

    logger.log('=== Admin user created successfully! ===');
    logger.log('Admin credentials:');
    logger.log('Username: admin');
    logger.log('Password: admin123');
    logger.log('=== Seeding process completed ===');

    await app.close();
    logger.log('Application context closed');
  } catch (error) {
    logger.error('=== Error during seeding process ===');
    logger.error('Error details:', error);
    process.exit(1);
  }
}

bootstrap();

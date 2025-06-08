import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResultsController } from './results.controller';
import { ResultsService } from './results.service';
import { Result } from './entities/result.entity';
import { Answer } from '../answers/entities/answer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Result, Answer])],
  controllers: [ResultsController],
  providers: [ResultsService],
  exports: [ResultsService],
})
export class ResultsModule {}

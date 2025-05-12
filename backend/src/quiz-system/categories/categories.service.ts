import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { plainToInstance } from 'class-transformer';
import { Logger } from '@nestjs/common';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) { }

  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const category = this.categoriesRepository.create(createCategoryDto);
    const savedCategory = await this.categoriesRepository.save(category);
    return plainToInstance(CategoryResponseDto, savedCategory);
  }

  async findAll(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoriesRepository.find();
    return plainToInstance(CategoryResponseDto, categories);
  }

  async findOne(id: number): Promise<CategoryResponseDto> {
    this.logger.debug(`Looking up category with ID: ${id}`);

    try {
      const category = await this.categoriesRepository.findOne({ where: { id } });

      if (!category) {
        this.logger.warn(`Category not found with ID: ${id}`);
        throw new NotFoundException(`Category with ID ${id} not found`);
      }

      this.logger.debug(`Found category: ${JSON.stringify(category)}`);
      return plainToInstance(CategoryResponseDto, category);
    } catch (error) {
      this.logger.error(`Error finding category: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: number, updateCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    Object.assign(category, updateCategoryDto);
    const updatedCategory = await this.categoriesRepository.save(category);
    return plainToInstance(CategoryResponseDto, updatedCategory);
  }

  async remove(id: number): Promise<void> {
    const result = await this.categoriesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
  }

  async count(): Promise<number> {
    return this.categoriesRepository.count();
  }
} 
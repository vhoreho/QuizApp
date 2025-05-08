import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CategoriesService {
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
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return plainToInstance(CategoryResponseDto, category);
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
} 
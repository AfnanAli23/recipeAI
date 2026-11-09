import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiService } from '../ai/ai.service';
import { Recipe } from './recipe.entity';
import { SaveRecipeDto } from './recipes.dto';

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(Recipe) private readonly repo: Repository<Recipe>,
    private readonly ai: AiService,
  ) {}

  // Drafts are NOT stored. The user picks one and clicks "Save" (see save()).
  generate(ingredients: string[]) {
    return this.ai.generateRecipes(ingredients);
  }

  save(userId: string, dto: SaveRecipeDto) {
    return this.repo.save(
      this.repo.create({
        ...dto,
        userId, // comes from the verified JWT, never from the request body
        imageUrl: this.ai.imageUrlFor(dto.title),
      }),
    );
  }

  findAll(userId: string, favoritesOnly: boolean) {
    return this.repo.find({
      where: favoritesOnly ? { userId, isFavorite: true } : { userId },
      order: { createdAt: 'DESC' },
    });
  }

  // Every lookup includes userId => users can only touch THEIR recipes.
  // We answer 404 (not 403) so outsiders can't even tell that an id exists.
  async findOne(userId: string, id: string) {
    const recipe = await this.repo.findOneBy({ id, userId });
    if (!recipe) throw new NotFoundException('Recipe not found');
    return recipe;
  }

  async toggleFavorite(userId: string, id: string) {
    const recipe = await this.findOne(userId, id);
    recipe.isFavorite = !recipe.isFavorite;
    return this.repo.save(recipe);
  }

  async rate(userId: string, id: string, rating: number) {
    const recipe = await this.findOne(userId, id);
    recipe.rating = rating;
    return this.repo.save(recipe);
  }

  async remove(userId: string, id: string) {
    const recipe = await this.findOne(userId, id);
    await this.repo.remove(recipe);
  }
}

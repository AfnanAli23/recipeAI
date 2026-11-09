import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard, UserId } from '../auth/jwt-auth.guard';
import { GenerateRecipesDto, RateRecipeDto, SaveRecipeDto } from './recipes.dto';
import { RecipesService } from './recipes.service';

@UseGuards(JwtAuthGuard) // every route below requires a valid token
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipes: RecipesService) {}

  // AI calls cost money/quota -> only 10 per minute per IP.
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('generate')
  @HttpCode(200)
  generate(@Body() dto: GenerateRecipesDto) {
    return this.recipes.generate(dto.ingredients);
  }

  @Post()
  save(@UserId() userId: string, @Body() dto: SaveRecipeDto) {
    return this.recipes.save(userId, dto);
  }

  @Get()
  findAll(@UserId() userId: string, @Query('favorite') favorite?: string) {
    return this.recipes.findAll(userId, favorite === 'true');
  }

  // ParseUUIDPipe rejects anything that isn't a UUID before it reaches the database.
  @Get(':id')
  findOne(@UserId() userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.recipes.findOne(userId, id);
  }

  @Patch(':id/favorite')
  toggleFavorite(@UserId() userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.recipes.toggleFavorite(userId, id);
  }

  @Patch(':id/rating')
  rate(
    @UserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RateRecipeDto,
  ) {
    return this.recipes.rate(userId, id, dto.rating);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@UserId() userId: string, @Param('id', ParseUUIDPipe) id: string) {
    await this.recipes.remove(userId, id);
  }
}

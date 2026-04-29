import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { SizesRepository } from "./sizes.repository";

@Controller("common/sizes")
export class SizesController {
  public constructor(private readonly repository: SizesRepository) {}

  @Get()
  public list() { return this.repository.list(); }

  @Get(":id")
  public get(@Param("id") id: string) { return this.repository.get(Number(id)); }

  @Post()
  public create(@Body() body: Record<string, unknown>) { return this.repository.create(body); }

  @Patch(":id")
  public update(@Param("id") id: string, @Body() body: Record<string, unknown>) { return this.repository.update(Number(id), body); }

  @Delete(":id")
  public delete(@Param("id") id: string, @Query("force") force?: string) {
    return force === "true" ? this.repository.forceDelete(Number(id)) : this.repository.drop(Number(id));
  }
}

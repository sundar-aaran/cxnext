import { Controller, Get, Param } from "@nestjs/common";
import { CommonLocationControllerBase } from "../shared/common-location-controller";
import { CommonLocationRepository } from "../shared/common-location.repository";

@Controller("common/cities")
export class CitiesController extends CommonLocationControllerBase {
  public constructor(repository: CommonLocationRepository) {
    super(repository, "cities");
  }

  @Get()
  public list() {
    return this.listRecords();
  }

  @Get(":id")
  public getById(@Param("id") id: string) {
    return this.getRecord(id);
  }
}

import { Controller, Get, Inject, Post } from "@nestjs/common";
import { RequirePermissions } from "../../modules/auth/interface/http/auth-context";
import { modulePermission } from "../../modules/auth/interface/http/module-permissions";
import { SystemUpdateService } from "./system-update.service";

@Controller("system-update")
@RequirePermissions(modulePermission("auth", "update"))
export class SystemUpdateController {
  public constructor(
    @Inject(SystemUpdateService)
    private readonly systemUpdateService: SystemUpdateService,
  ) {}

  @Get("status")
  public status() {
    return this.systemUpdateService.status();
  }

  @Post("preflight")
  public preflight() {
    return this.systemUpdateService.preflight();
  }

  @Post("sync")
  public sync() {
    return this.systemUpdateService.sync();
  }

  @Post("build")
  public build() {
    return this.systemUpdateService.build();
  }

  @Post("restart")
  public restart() {
    return this.systemUpdateService.restart();
  }

  @Post("smoke")
  public smoke() {
    return this.systemUpdateService.smoke();
  }

  @Post("deploy")
  public deploy() {
    return this.systemUpdateService.deploy();
  }
}

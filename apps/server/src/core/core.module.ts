import { Global, Module } from "@nestjs/common";
import { ModuleRegistryService } from "./modules/module-registry.service";
import { CoreSettingsController } from "./settings/core-settings.controller";
import { CoreSettingsService } from "./settings/core-settings.service";

@Global()
@Module({
  controllers: [CoreSettingsController],
  providers: [CoreSettingsService, ModuleRegistryService],
  exports: [CoreSettingsService, ModuleRegistryService],
})
export class CoreModule {}

import { Global, Module } from "@nestjs/common";
import { ModuleRegistryService } from "./modules/module-registry.service";

@Global()
@Module({
  providers: [ModuleRegistryService],
  exports: [ModuleRegistryService],
})
export class CoreModule {}

import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { AUTH_DOMAIN_EVENT_PUBLISHER, type AuthDomainEventPublisher } from "../services/domain-event-publisher";
import {
  AUTH_REPOSITORY,
  type AuthRepository,
  type AuthUserUpsertParams,
} from "../services/auth.repository";
import { PasswordService } from "../services/password.service";
import { AuthUserAccessUpdatedEvent } from "../../domain/events/auth-user-access-updated.event";
import { AuthUserProvisionedEvent } from "../../domain/events/auth-user-provisioned.event";

@Injectable()
export class ListAuthUsersUseCase {
  public constructor(@Inject(AUTH_REPOSITORY) private readonly repository: AuthRepository) {}

  public execute() {
    return this.repository.listUsers();
  }
}

@Injectable()
export class GetAuthUserUseCase {
  public constructor(@Inject(AUTH_REPOSITORY) private readonly repository: AuthRepository) {}

  public execute(userId: string) {
    return this.repository.findUserById(userId);
  }
}

@Injectable()
export class CreateAuthUserUseCase {
  public constructor(
    @Inject(AUTH_REPOSITORY) private readonly repository: AuthRepository,
    private readonly passwords: PasswordService,
    @Inject(AUTH_DOMAIN_EVENT_PUBLISHER)
    private readonly eventPublisher: AuthDomainEventPublisher,
  ) {}

  public async execute(params: AuthUserUpsertParams) {
    const roleKeys = await resolveValidatedRoleKeys(this.repository, params.roleKeys);
    const user = await this.repository.createUser({
      ...params,
      roleKeys,
      passwordHash: this.passwords.hash(params.password ?? ""),
    });

    await this.eventPublisher.publishAll([
      new AuthUserProvisionedEvent(
        user.id,
        user.tenant.id,
        user.roles.map((role) => role.key),
        user.permissions.map((permission) => permission.key),
      ),
    ]);

    return user;
  }
}

@Injectable()
export class UpdateAuthUserUseCase {
  public constructor(
    @Inject(AUTH_REPOSITORY) private readonly repository: AuthRepository,
    private readonly passwords: PasswordService,
    @Inject(AUTH_DOMAIN_EVENT_PUBLISHER)
    private readonly eventPublisher: AuthDomainEventPublisher,
  ) {}

  public async execute(userId: string, params: AuthUserUpsertParams) {
    const roleKeys = await resolveValidatedRoleKeys(this.repository, params.roleKeys);
    const user = await this.repository.updateUser(userId, {
      ...params,
      roleKeys,
      passwordHash: params.password ? this.passwords.hash(params.password) : null,
    });

    if (user) {
      await this.eventPublisher.publishAll([
        new AuthUserAccessUpdatedEvent(
          user.id,
          user.tenant.id,
          user.roles.map((role) => role.key),
          user.permissions.map((permission) => permission.key),
          user.isActive,
        ),
      ]);
    }

    return user;
  }
}

@Injectable()
export class ListAuthRolesUseCase {
  public constructor(@Inject(AUTH_REPOSITORY) private readonly repository: AuthRepository) {}

  public execute() {
    return this.repository.listRoles();
  }
}

@Injectable()
export class ListAuthPermissionsUseCase {
  public constructor(@Inject(AUTH_REPOSITORY) private readonly repository: AuthRepository) {}

  public execute() {
    return this.repository.listPermissions();
  }
}

async function resolveValidatedRoleKeys(
  repository: AuthRepository,
  roleKeys: readonly string[],
): Promise<readonly string[]> {
  const uniqueRoleKeys = [...new Set(roleKeys.map((roleKey) => roleKey.trim()).filter(Boolean))];

  if (uniqueRoleKeys.length === 0) {
    throw new BadRequestException("At least one active role is required.");
  }

  const activeRoleKeys = await repository.findActiveRoleKeys(uniqueRoleKeys);
  const missingRoleKeys = uniqueRoleKeys.filter((roleKey) => !activeRoleKeys.includes(roleKey));

  if (missingRoleKeys.length > 0) {
    throw new BadRequestException(`Unknown or inactive roles: ${missingRoleKeys.join(", ")}.`);
  }

  return activeRoleKeys;
}

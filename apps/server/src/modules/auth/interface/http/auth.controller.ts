import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  CreateAuthRoleUseCase,
  CreateAuthPermissionModuleUseCase,
  CreateAuthPolicyUseCase,
  CreateAuthUserUseCase,
  DeleteAuthPermissionModuleUseCase,
  DeleteAuthPolicyUseCase,
  DeleteAuthRoleUseCase,
  GetAuthUserUseCase,
  ListAuthGatesUseCase,
  ListAuthPermissionsUseCase,
  ListAuthPoliciesUseCase,
  ListAuthRolesUseCase,
  ListAuthUsersUseCase,
  UpdateAuthPermissionModuleUseCase,
  UpdateAuthPolicyUseCase,
  UpdateAuthRoleUseCase,
  UpdateAuthUserUseCase,
} from "../../application/use-cases/user-admin.use-cases";
import { LoginUseCase } from "../../application/use-cases/login.use-case";
import { AUTH_REPOSITORY, type AuthRepository } from "../../application/services/auth.repository";
import { AuthGuard } from "./auth.guard";
import { CurrentAuth, RequirePermissions, type AuthRequestContext } from "./auth-context";
import { modulePermission } from "./module-permissions";
import {
  toAuthGateResponse,
  toAuthPermissionModuleResponse,
  toAuthPolicyResponse,
  toAuthRoleResponse,
  toAuthUserResponse,
} from "./auth-response";

interface LoginRequest {
  readonly login?: unknown;
  readonly password?: unknown;
}

interface UserUpsertRequest {
  readonly tenantId?: unknown;
  readonly username?: unknown;
  readonly email?: unknown;
  readonly displayName?: unknown;
  readonly password?: unknown;
  readonly isActive?: unknown;
  readonly roleKeys?: unknown;
}

interface RoleUpsertRequest {
  readonly key?: unknown;
  readonly name?: unknown;
  readonly description?: unknown;
  readonly isActive?: unknown;
}

interface PolicyUpsertRequest {
  readonly key?: unknown;
  readonly name?: unknown;
  readonly description?: unknown;
  readonly isActive?: unknown;
}

interface PermissionModuleUpsertRequest {
  readonly key?: unknown;
  readonly name?: unknown;
  readonly boundedContext?: unknown;
  readonly description?: unknown;
  readonly isActive?: unknown;
  readonly policyKeys?: unknown;
}

@Controller("auth")
@UseGuards(AuthGuard)
export class AuthController {
  public constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly listUsersUseCase: ListAuthUsersUseCase,
    private readonly getUserUseCase: GetAuthUserUseCase,
    private readonly createUserUseCase: CreateAuthUserUseCase,
    private readonly updateUserUseCase: UpdateAuthUserUseCase,
    private readonly listRolesUseCase: ListAuthRolesUseCase,
    private readonly createRoleUseCase: CreateAuthRoleUseCase,
    private readonly updateRoleUseCase: UpdateAuthRoleUseCase,
    private readonly deleteRoleUseCase: DeleteAuthRoleUseCase,
    private readonly listPermissionsUseCase: ListAuthPermissionsUseCase,
    private readonly createPermissionModuleUseCase: CreateAuthPermissionModuleUseCase,
    private readonly updatePermissionModuleUseCase: UpdateAuthPermissionModuleUseCase,
    private readonly deletePermissionModuleUseCase: DeleteAuthPermissionModuleUseCase,
    private readonly listPoliciesUseCase: ListAuthPoliciesUseCase,
    private readonly createPolicyUseCase: CreateAuthPolicyUseCase,
    private readonly updatePolicyUseCase: UpdateAuthPolicyUseCase,
    private readonly deletePolicyUseCase: DeleteAuthPolicyUseCase,
    private readonly listGatesUseCase: ListAuthGatesUseCase,
    @Inject(AUTH_REPOSITORY) private readonly repository: AuthRepository,
  ) {}

  @Post("login")
  public async login(@Body() body: LoginRequest) {
    const session = await this.loginUseCase.execute({
      login: typeof body.login === "string" ? body.login : "",
      password: typeof body.password === "string" ? body.password : "",
    });

    return {
      ...session,
      user: toAuthUserResponse(session.user),
    };
  }

  @Get("me")
  @RequirePermissions(modulePermission("auth", "read"))
  public me(@CurrentAuth() auth: AuthRequestContext) {
    return toAuthUserResponse(auth.user);
  }

  @Post("logout")
  @RequirePermissions(modulePermission("auth", "read"))
  public async logout(@CurrentAuth() auth: AuthRequestContext) {
    await this.repository.revokeSession(auth.sessionId);
    return { loggedOut: true };
  }

  @Get("users")
  @RequirePermissions(modulePermission("auth", "read"))
  public async listUsers() {
    const users = await this.listUsersUseCase.execute();
    return users.map(toAuthUserResponse);
  }

  @Get("users/:userId")
  @RequirePermissions(modulePermission("auth", "read"))
  public async getUser(@Param("userId") userId: string) {
    const user = await this.getUserUseCase.execute(userId);
    if (!user) throw new NotFoundException(`User "${userId}" was not found.`);
    return toAuthUserResponse(user);
  }

  @Post("users")
  @RequirePermissions(modulePermission("auth", "update"))
  public async createUser(@Body() body: UserUpsertRequest) {
    const user = await this.createUserUseCase.execute(parseUserRequest(body, true));
    return toAuthUserResponse(user);
  }

  @Patch("users/:userId")
  @RequirePermissions(modulePermission("auth", "update"))
  public async updateUser(@Param("userId") userId: string, @Body() body: UserUpsertRequest) {
    const user = await this.updateUserUseCase.execute(userId, parseUserRequest(body, false));
    if (!user) throw new NotFoundException(`User "${userId}" was not found.`);
    return toAuthUserResponse(user);
  }

  @Get("roles")
  @RequirePermissions(modulePermission("auth", "read"))
  public async listRoles() {
    const roles = await this.listRolesUseCase.execute();
    return roles.map(toAuthRoleResponse);
  }

  @Post("roles")
  @RequirePermissions(modulePermission("auth", "update"))
  public async createRole(@Body() body: RoleUpsertRequest) {
    const role = await this.createRoleUseCase.execute(parseRoleRequest(body));
    return toAuthRoleResponse(role);
  }

  @Patch("roles/:roleId")
  @RequirePermissions(modulePermission("auth", "update"))
  public async updateRole(@Param("roleId") roleId: string, @Body() body: RoleUpsertRequest) {
    const role = await this.updateRoleUseCase.execute(roleId, parseRoleRequest(body));
    if (!role) throw new NotFoundException(`Role "${roleId}" was not found.`);
    return toAuthRoleResponse(role);
  }

  @Delete("roles/:roleId")
  @RequirePermissions(modulePermission("auth", "update"))
  public async deleteRole(@Param("roleId") roleId: string) {
    const deleted = await this.deleteRoleUseCase.execute(roleId);
    if (!deleted) throw new NotFoundException(`Role "${roleId}" was not found or cannot be deleted.`);
    return { deleted: true };
  }

  @Get("permissions")
  @RequirePermissions(modulePermission("auth", "read"))
  public async listPermissions() {
    const permissions = await this.listPermissionsUseCase.execute();
    return permissions.map(toAuthPermissionModuleResponse);
  }

  @Post("permissions")
  @RequirePermissions(modulePermission("auth", "update"))
  public async createPermissionModule(@Body() body: PermissionModuleUpsertRequest) {
    const moduleRecord = await this.createPermissionModuleUseCase.execute(parsePermissionModuleRequest(body));
    return toAuthPermissionModuleResponse(moduleRecord);
  }

  @Patch("permissions/:moduleId")
  @RequirePermissions(modulePermission("auth", "update"))
  public async updatePermissionModule(
    @Param("moduleId") moduleId: string,
    @Body() body: PermissionModuleUpsertRequest,
  ) {
    const moduleRecord = await this.updatePermissionModuleUseCase.execute(
      moduleId,
      parsePermissionModuleRequest(body),
    );
    if (!moduleRecord) throw new NotFoundException(`Permission module "${moduleId}" was not found.`);
    return toAuthPermissionModuleResponse(moduleRecord);
  }

  @Delete("permissions/:moduleId")
  @RequirePermissions(modulePermission("auth", "update"))
  public async deletePermissionModule(@Param("moduleId") moduleId: string) {
    const deleted = await this.deletePermissionModuleUseCase.execute(moduleId);
    if (!deleted) {
      throw new NotFoundException(`Permission module "${moduleId}" was not found or cannot be deleted.`);
    }
    return { deleted: true };
  }

  @Get("policies")
  @RequirePermissions(modulePermission("auth", "read"))
  public async listPolicies() {
    const policies = await this.listPoliciesUseCase.execute();
    return policies.map(toAuthPolicyResponse);
  }

  @Post("policies")
  @RequirePermissions(modulePermission("auth", "update"))
  public async createPolicy(@Body() body: PolicyUpsertRequest) {
    const policy = await this.createPolicyUseCase.execute(parsePolicyRequest(body));
    return toAuthPolicyResponse(policy);
  }

  @Patch("policies/:policyId")
  @RequirePermissions(modulePermission("auth", "update"))
  public async updatePolicy(@Param("policyId") policyId: string, @Body() body: PolicyUpsertRequest) {
    const policy = await this.updatePolicyUseCase.execute(policyId, parsePolicyRequest(body));
    if (!policy) throw new NotFoundException(`Policy "${policyId}" was not found.`);
    return toAuthPolicyResponse(policy);
  }

  @Delete("policies/:policyId")
  @RequirePermissions(modulePermission("auth", "update"))
  public async deletePolicy(@Param("policyId") policyId: string) {
    const deleted = await this.deletePolicyUseCase.execute(policyId);
    if (!deleted) throw new NotFoundException(`Policy "${policyId}" was not found or cannot be deleted.`);
    return { deleted: true };
  }

  @Get("gates")
  @RequirePermissions(modulePermission("auth", "read"))
  public async listGates() {
    const gates = await this.listGatesUseCase.execute();
    return gates.map(toAuthGateResponse);
  }
}

function parseUserRequest(body: UserUpsertRequest, requiresPassword: boolean) {
  const password = typeof body.password === "string" && body.password ? body.password : null;

  if (requiresPassword && !password) {
    throw new BadRequestException("Password is required.");
  }

  return {
    tenantId: typeof body.tenantId === "string" ? body.tenantId : "",
    username: typeof body.username === "string" ? body.username : "",
    email: typeof body.email === "string" ? body.email : "",
    displayName: typeof body.displayName === "string" ? body.displayName : "",
    password,
    isActive: body.isActive !== false,
    roleKeys: Array.isArray(body.roleKeys)
      ? body.roleKeys.filter((roleKey): roleKey is string => typeof roleKey === "string")
      : [],
  };
}

function parseRoleRequest(body: RoleUpsertRequest) {
  const key = typeof body.key === "string" ? body.key : "";
  const name = typeof body.name === "string" ? body.name : "";

  if (!key.trim()) {
    throw new BadRequestException("Role key is required.");
  }

  if (!name.trim()) {
    throw new BadRequestException("Role name is required.");
  }

  return {
    key,
    name,
    description: typeof body.description === "string" ? body.description : null,
    isActive: body.isActive !== false,
  };
}

function parsePolicyRequest(body: PolicyUpsertRequest) {
  const key = typeof body.key === "string" ? body.key : "";
  const name = typeof body.name === "string" ? body.name : "";

  if (!key.trim()) {
    throw new BadRequestException("Policy key is required.");
  }

  if (!name.trim()) {
    throw new BadRequestException("Policy name is required.");
  }

  return {
    key,
    name,
    description: typeof body.description === "string" ? body.description : null,
    isActive: body.isActive !== false,
  };
}

function parsePermissionModuleRequest(body: PermissionModuleUpsertRequest) {
  const key = typeof body.key === "string" ? body.key : "";
  const name = typeof body.name === "string" ? body.name : "";
  const boundedContext = typeof body.boundedContext === "string" ? body.boundedContext : "";
  const policyKeys = Array.isArray(body.policyKeys)
    ? body.policyKeys.filter((policyKey): policyKey is string => typeof policyKey === "string")
    : [];

  if (!key.trim()) {
    throw new BadRequestException("Permission module key is required.");
  }

  if (!name.trim()) {
    throw new BadRequestException("Permission module name is required.");
  }

  if (!boundedContext.trim()) {
    throw new BadRequestException("Bounded context is required.");
  }

  return {
    key,
    name,
    boundedContext,
    description: typeof body.description === "string" ? body.description : null,
    isActive: body.isActive !== false,
    policyKeys,
  };
}

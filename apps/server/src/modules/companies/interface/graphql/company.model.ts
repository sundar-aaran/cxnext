import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType("Company")
export class CompanyModel {
  @Field()
  public id!: string;

  @Field()
  public tenantId!: string;

  @Field()
  public tenantName!: string;

  @Field()
  public industryId!: string;

  @Field()
  public industryName!: string;

  @Field()
  public name!: string;

  @Field(() => String, { nullable: true })
  public legalName!: string | null;

  @Field(() => String, { nullable: true })
  public tagline!: string | null;

  @Field(() => String, { nullable: true })
  public shortAbout!: string | null;

  @Field(() => String, { nullable: true })
  public primaryEmail!: string | null;

  @Field(() => String, { nullable: true })
  public primaryPhone!: string | null;

  @Field()
  public isPrimary!: boolean;

  @Field()
  public isActive!: boolean;

  @Field()
  public createdAt!: string;

  @Field()
  public updatedAt!: string;

  @Field(() => String, { nullable: true })
  public deletedAt!: string | null;
}

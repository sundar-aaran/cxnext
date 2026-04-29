import { Module } from "@nestjs/common";
import { CountriesModule } from "./countries/countries.module";
import { StatesModule } from "./states/states.module";
import { DistrictsModule } from "./districts/districts.module";
import { CitiesModule } from "./cities/cities.module";
import { PincodesModule } from "./pincodes/pincodes.module";
import { ContactGroupsModule } from "./contact-groups/contact-groups.module";
import { ContactTypesModule } from "./contact-types/contact-types.module";
import { AddressTypesModule } from "./address-types/address-types.module";
import { BankNamesModule } from "./bank-names/bank-names.module";
import { ProductGroupsModule } from "./product-groups/product-groups.module";
import { ProductCategoriesModule } from "./product-categories/product-categories.module";
import { ProductTypesModule } from "./product-types/product-types.module";
import { BrandsModule } from "./brands/brands.module";
import { ColoursModule } from "./colours/colours.module";
import { SizesModule } from "./sizes/sizes.module";
import { StylesModule } from "./styles/styles.module";
import { UnitsModule } from "./units/units.module";
import { HsnCodesModule } from "./hsn-codes/hsn-codes.module";
import { TaxesModule } from "./taxes/taxes.module";
import { WarehousesModule } from "./warehouses/warehouses.module";
import { TransportsModule } from "./transports/transports.module";
import { DestinationsModule } from "./destinations/destinations.module";
import { OrderTypesModule } from "./order-types/order-types.module";
import { StockRejectionTypesModule } from "./stock-rejection-types/stock-rejection-types.module";
import { CurrenciesModule } from "./currencies/currencies.module";
import { PaymentTermsModule } from "./payment-terms/payment-terms.module";

@Module({
  imports: [CountriesModule, StatesModule, DistrictsModule, CitiesModule, PincodesModule, ContactGroupsModule, ContactTypesModule, AddressTypesModule, BankNamesModule, ProductGroupsModule, ProductCategoriesModule, ProductTypesModule, BrandsModule, ColoursModule, SizesModule, StylesModule, UnitsModule, HsnCodesModule, TaxesModule, WarehousesModule, TransportsModule, DestinationsModule, OrderTypesModule, StockRejectionTypesModule, CurrenciesModule, PaymentTermsModule],
})
export class CommonModule {}

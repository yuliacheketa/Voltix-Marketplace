import { Component } from "@angular/core";
import { CompareTableComponent } from "../../components/compare-table/compare-table.component";
import { PriceHistoryComponent } from "../../components/price-history/price-history.component";
import { ProductSelectorComponent } from "../../components/product-selector/product-selector.component";
import { RadarChartComponent } from "../../components/radar-chart/radar-chart.component";

@Component({
  selector: "app-compare-page",
  standalone: true,
  imports: [
    ProductSelectorComponent,
    CompareTableComponent,
    RadarChartComponent,
    PriceHistoryComponent,
  ],
  templateUrl: "./compare-page.component.html",
  styleUrl: "./compare-page.component.scss",
})
export class ComparePageComponent {}

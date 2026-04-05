import { Component, OnDestroy, OnInit, computed, signal } from "@angular/core";
import { PolarChartModule } from "@swimlane/ngx-charts";
import type { Product } from "@voltix/api-client";
import { compareStore } from "@voltix/shared-state";
import {
  normalizeRow,
  radarDimensions,
  rawMetric,
} from "../../utils/compare-specs";

@Component({
  selector: "app-radar-chart",
  standalone: true,
  imports: [PolarChartModule],
  templateUrl: "./radar-chart.component.html",
  styleUrl: "./radar-chart.component.scss",
})
export class RadarChartComponent implements OnInit, OnDestroy {
  readonly products = signal<Product[]>([]);
  private unsub: (() => void) | null = null;
  readonly view = signal<[number, number]>([700, 400]);

  readonly chartResults = computed(() => {
    const prods = this.products();
    const dimsAll = radarDimensions(prods);
    const dims = dimsAll.filter((d) =>
      prods.every((p) => rawMetric(p, d) != null)
    );
    if (!dims.length || prods.length < 2) {
      return [] as {
        name: string;
        series: { name: string; value: number }[];
      }[];
    }
    return prods.map((p, i) => ({
      name: p.title,
      series: dims.map((d) => {
        const col = prods.map((pr) => rawMetric(pr, d)!);
        const norm = normalizeRow(col);
        return {
          name: d,
          value: Math.round(norm[i] * 10) / 10,
        };
      }),
    }));
  });

  readonly scheme = "vivid";

  ngOnInit(): void {
    this.unsub = compareStore.subscribe(() => {
      this.products.set([...compareStore.getState().products]);
    });
    this.products.set([...compareStore.getState().products]);
  }

  ngOnDestroy(): void {
    this.unsub?.();
    this.unsub = null;
  }
}

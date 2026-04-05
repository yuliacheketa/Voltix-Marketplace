import {
  Component,
  OnDestroy,
  OnInit,
  computed,
  effect,
  signal,
} from "@angular/core";
import { LineChartModule } from "@swimlane/ngx-charts";
import type { Product } from "@voltix/api-client";
import { getPriceHistory } from "@voltix/api-client";
import { compareStore } from "@voltix/shared-state";

@Component({
  selector: "app-price-history",
  standalone: true,
  imports: [LineChartModule],
  templateUrl: "./price-history.component.html",
  styleUrl: "./price-history.component.scss",
})
export class PriceHistoryComponent implements OnInit, OnDestroy {
  readonly products = signal<Product[]>([]);
  readonly chartData = signal<
    { name: string; series: { name: string; value: number }[] }[]
  >([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly view = signal<[number, number]>([700, 360]);
  readonly scheme = "vivid";
  private unsub: (() => void) | null = null;

  readonly hasData = computed(() => this.chartData().length > 0);

  constructor() {
    effect(
      () => {
        const prods = this.products();
        if (!prods.length) {
          this.chartData.set([]);
          this.loading.set(false);
          this.error.set(null);
          return;
        }
        void this.loadSeries(prods);
      },
      { allowSignalWrites: true }
    );
  }

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

  private async loadSeries(prods: Product[]): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const series = await Promise.all(
        prods.map(async (p) => {
          const pts = await getPriceHistory(p.id);
          return {
            name: p.title,
            series: pts.map((pt) => ({
              name: this.formatDate(pt.at),
              value: pt.price,
            })),
          };
        })
      );
      this.chartData.set(series);
    } catch {
      this.error.set("Could not load price history.");
      this.chartData.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  private formatDate(at: string): string {
    const d = new Date(at);
    if (Number.isNaN(d.getTime())) {
      return at;
    }
    return d.toLocaleDateString();
  }
}

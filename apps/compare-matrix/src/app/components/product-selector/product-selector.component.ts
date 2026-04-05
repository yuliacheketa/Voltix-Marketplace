import { Component, OnDestroy, OnInit, computed, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { getProducts } from "@voltix/api-client";
import type { Product } from "@voltix/api-client";
import { COMPARE_MAX_ITEMS, compareStore } from "@voltix/shared-state";
import { Subject, of } from "rxjs";
import { debounceTime, distinctUntilChanged, switchMap } from "rxjs/operators";

@Component({
  selector: "app-product-selector",
  standalone: true,
  imports: [FormsModule],
  templateUrl: "./product-selector.component.html",
  styleUrl: "./product-selector.component.scss",
})
export class ProductSelectorComponent implements OnInit, OnDestroy {
  readonly max = COMPARE_MAX_ITEMS;
  query = "";
  readonly results = signal<Product[]>([]);
  readonly loading = signal(false);
  readonly productCount = signal(0);
  readonly atMax = computed(() => this.productCount() >= COMPARE_MAX_ITEMS);
  private readonly search$ = new Subject<string>();
  private storeUnsub: (() => void) | null = null;

  ngOnInit(): void {
    this.storeUnsub = compareStore.subscribe(() => {
      this.productCount.set(compareStore.getState().products.length);
    });
    this.productCount.set(compareStore.getState().products.length);
    this.search$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((q) => {
          if (!q) {
            this.loading.set(false);
            return of([] as Product[]);
          }
          this.loading.set(true);
          return getProducts({ search: q, limit: 20 });
        })
      )
      .subscribe((list) => {
        this.results.set(list);
        this.loading.set(false);
      });
  }

  ngOnDestroy(): void {
    this.storeUnsub?.();
    this.storeUnsub = null;
  }

  onQueryChange(value: string): void {
    this.query = value;
    this.search$.next(value.trim());
  }

  pick(p: Product): void {
    compareStore.getState().addProduct(p);
    this.results.set([]);
    this.query = "";
  }
}

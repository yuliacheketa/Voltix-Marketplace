import { Component, OnDestroy, OnInit, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import type { Product } from "@voltix/api-client";
import { compareStore } from "@voltix/shared-state";

@Component({
  selector: "app-compare-bar",
  standalone: true,
  templateUrl: "./compare-bar.component.html",
  styleUrl: "./compare-bar.component.scss",
})
export class CompareBarComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  readonly products = signal<Product[]>([]);
  private unsub: (() => void) | null = null;

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

  remove(productId: string, ev: Event): void {
    ev.stopPropagation();
    ev.preventDefault();
    compareStore.getState().removeProduct(productId);
  }

  compareNow(): void {
    void this.router.navigate(["/compare"]);
  }
}

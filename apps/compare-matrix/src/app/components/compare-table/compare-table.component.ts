import { Component, OnDestroy, OnInit, computed, signal } from "@angular/core";
import type { Product } from "@voltix/api-client";
import { compareStore } from "@voltix/shared-state";
import {
  collectRowKeys,
  getCellDisplay,
  higherIsBetter,
  parseNumericForRow,
} from "../../utils/compare-specs";

type CellTier = "best" | "worst" | null;

interface TableCell {
  productId: string;
  display: string;
  tier: CellTier;
}

interface TableRow {
  rowKey: string;
  cells: TableCell[];
}

@Component({
  selector: "app-compare-table",
  standalone: true,
  templateUrl: "./compare-table.component.html",
  styleUrl: "./compare-table.component.scss",
})
export class CompareTableComponent implements OnInit, OnDestroy {
  readonly products = signal<Product[]>([]);
  private unsub: (() => void) | null = null;

  readonly tableRows = computed<TableRow[]>(() => {
    const prods = this.products();
    const keys = collectRowKeys(prods);
    return keys.map((rowKey) => {
      const cells = prods.map((p) => {
        const display = getCellDisplay(p, rowKey);
        const numeric = parseNumericForRow(rowKey, p, display);
        return {
          productId: p.id,
          display,
          numeric,
          tier: null as CellTier,
        };
      });
      const nums = cells
        .map((c) => c.numeric)
        .filter((v): v is number => v != null);
      if (nums.length < 2) {
        return {
          rowKey,
          cells: cells.map(({ productId, display }) => ({
            productId,
            display,
            tier: null,
          })),
        };
      }
      const hi = higherIsBetter(rowKey);
      const bestVal = hi ? Math.max(...nums) : Math.min(...nums);
      const worstVal = hi ? Math.min(...nums) : Math.max(...nums);
      const mapped = cells.map((c) => {
        let tier: CellTier = null;
        if (c.numeric != null && bestVal !== worstVal) {
          if (c.numeric === bestVal) {
            tier = "best";
          } else if (c.numeric === worstVal) {
            tier = "worst";
          }
        }
        return {
          productId: c.productId,
          display: c.display,
          tier,
        };
      });
      return { rowKey, cells: mapped };
    });
  });

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

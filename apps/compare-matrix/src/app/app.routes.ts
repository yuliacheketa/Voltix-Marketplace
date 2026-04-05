import { Routes } from "@angular/router";
import { ComparePageComponent } from "./pages/compare-page/compare-page.component";
import { EmptyHomeComponent } from "./pages/empty-home/empty-home.component";

export const routes: Routes = [
  { path: "", component: EmptyHomeComponent },
  { path: "compare", component: ComparePageComponent },
];

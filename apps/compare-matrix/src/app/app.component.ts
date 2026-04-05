import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { CompareBarComponent } from "./components/compare-bar/compare-bar.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, CompareBarComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent {}

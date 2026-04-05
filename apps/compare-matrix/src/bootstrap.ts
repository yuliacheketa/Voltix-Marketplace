import type { ApplicationRef } from "@angular/core";
import { createApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";
import { appConfig } from "./app/app.config";

let appRef: ApplicationRef | null = null;

export default {
  async mount(target: HTMLElement | string | null | undefined) {
    const el =
      typeof target === "string" ? document.querySelector(target) : target;
    if (!el || !(el instanceof HTMLElement)) {
      return;
    }
    appRef = await createApplication(appConfig);
    appRef.bootstrap(AppComponent, el);
  },
  unmount() {
    appRef?.destroy();
    appRef = null;
  },
};

import { createApp } from "vue";
import App from "./App.vue";
import { createCheckoutRouter } from "./router.js";

export function mountCheckout(el) {
  const router = createCheckoutRouter();
  const app = createApp(App);
  app.use(router);
  app.mount(el);
  return app;
}

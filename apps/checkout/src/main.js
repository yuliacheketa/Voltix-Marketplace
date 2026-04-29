import Vue from "vue";
import App from "./App.vue";
import { createCheckoutRouter } from "./router.js";

export function mountCheckout(el) {
  const router = createCheckoutRouter();
  const app = new Vue({
    router,
    render: (h) => h(App),
  });
  app.$mount(el);
  return app;
}

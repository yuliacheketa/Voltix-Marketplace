import { createRouter, createWebHashHistory } from "vue-router";
import CartDrawer from "./components/CartDrawer.vue";
import CheckoutForm from "./components/CheckoutForm.vue";
import DeliveryOptions from "./components/DeliveryOptions.vue";
import PaymentForm from "./components/PaymentForm.vue";
import OrderSummary from "./components/OrderSummary.vue";
import OrderSuccess from "./components/OrderSuccess.vue";

export function createCheckoutRouter() {
  return createRouter({
    history: createWebHashHistory(),
    routes: [
      {
        path: "/",
        redirect: () => ({ path: "/cart", replace: true }),
      },
      { path: "/cart", name: "cart", component: CartDrawer },
      { path: "/checkout", redirect: "/checkout/contact" },
      {
        path: "/checkout/contact",
        name: "checkout-contact",
        component: CheckoutForm,
      },
      {
        path: "/checkout/delivery",
        name: "checkout-delivery",
        component: DeliveryOptions,
      },
      {
        path: "/checkout/payment",
        name: "checkout-payment",
        component: PaymentForm,
      },
      {
        path: "/checkout/summary",
        name: "checkout-summary",
        component: OrderSummary,
      },
      {
        path: "/order-success",
        name: "order-success",
        component: OrderSuccess,
        props: (route) => ({ orderId: route.query.id ?? "" }),
      },
    ],
  });
}

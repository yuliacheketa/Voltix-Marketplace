<template>
  <div class="overlay" @click.self="close">
    <aside class="panel" role="dialog" aria-label="Shopping cart">
      <header class="head">
        <h2 class="title">Cart</h2>
        <button type="button" class="close" @click="close">×</button>
      </header>
      <div v-if="items.length === 0" class="empty">Your cart is empty.</div>
      <div v-else class="list">
        <CartItem v-for="it in items" :key="it.productId" :item="it" />
      </div>
      <footer v-if="items.length" class="foot">
        <div class="subrow">
          <span>Subtotal</span>
          <strong>{{ subtotalFormatted }}</strong>
        </div>
        <router-link to="/checkout/contact" class="checkout-btn"
          >Checkout</router-link
        >
      </footer>
    </aside>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { cartStore, cartTotalPrice } from "@voltix/shared-state";
import { formatPrice } from "@voltix/utils";
import CartItem from "./CartItem.vue";

const router = useRouter();
const items = ref([]);
const subtotal = ref(0);

const subtotalFormatted = computed(() => formatPrice(subtotal.value, "USD"));

let unsub = () => {};

function sync() {
  items.value = [...cartStore.getState().items];
  subtotal.value = cartTotalPrice();
}

onMounted(() => {
  sync();
  unsub = cartStore.subscribe(sync);
});

onUnmounted(() => {
  unsub();
});

function close() {
  router.push({ name: "home" });
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgb(26 26 50 / 0.45);
  z-index: 2000;
  display: flex;
  justify-content: flex-end;
}
.panel {
  width: min(22rem, 100%);
  height: 100%;
  background: #fff;
  box-shadow: -4px 0 24px rgb(51 51 153 / 0.15);
  display: flex;
  flex-direction: column;
  animation: slide 0.22s ease-out;
}
@keyframes slide {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e2e2ef;
}
.title {
  margin: 0;
  font-size: 1.125rem;
  color: #1a1a34;
}
.close {
  border: none;
  background: #f3f3fa;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.375rem;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  color: #333399;
}
.close:hover {
  background: #ebebf7;
}
.list {
  flex: 1;
  overflow-y: auto;
  padding: 0 1.25rem;
}
.empty {
  flex: 1;
  padding: 2rem 1.25rem;
  color: #65657f;
  font-size: 0.9375rem;
}
.foot {
  padding: 1rem 1.25rem 1.5rem;
  border-top: 1px solid #e2e2ef;
}
.subrow {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 0.9375rem;
  color: #3a3a58;
}
.subrow strong {
  color: #333399;
  font-size: 1.05rem;
}
.checkout-btn {
  display: block;
  text-align: center;
  padding: 0.65rem 1rem;
  background: #333399;
  color: #fff;
  font-weight: 600;
  text-decoration: none;
  border-radius: 0.375rem;
}
.checkout-btn:hover {
  background: #2a2a7a;
}
</style>

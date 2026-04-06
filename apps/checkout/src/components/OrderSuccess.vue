<template>
  <div class="page">
    <div class="card">
      <div class="icon" aria-hidden="true">✓</div>
      <h1 class="h1">Замовлення оформлено</h1>
      <p class="txt">
        Дякуємо! Номер замовлення:
        <strong class="id">{{ orderId || "—" }}</strong>
      </p>
      <router-link to="/cart" class="btn">До кошика</router-link>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { cartStore } from "@voltix/shared-state";

const props = defineProps({
  orderId: { type: String, default: "" },
});

onMounted(() => {
  cartStore.getState().clearCart();
});
</script>

<style scoped>
.page {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}
.card {
  max-width: 22rem;
  text-align: center;
  background: #fff;
  border: 1px solid #e2e2ef;
  border-radius: 0.75rem;
  padding: 2rem 1.5rem;
  box-shadow: 0 4px 20px rgb(51 51 153 / 0.1);
}
.icon {
  width: 3rem;
  height: 3rem;
  margin: 0 auto 1rem;
  border-radius: 50%;
  background: #dcdcf0;
  color: #333399;
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.h1 {
  margin: 0 0 0.75rem;
  font-size: 1.35rem;
  color: #1a1a34;
}
.txt {
  margin: 0 0 1.5rem;
  font-size: 0.9375rem;
  color: #65657f;
  line-height: 1.5;
}
.id {
  color: #333399;
  word-break: break-all;
}
.btn {
  display: inline-block;
  font: inherit;
  font-weight: 600;
  padding: 0.55rem 1.25rem;
  border-radius: 0.375rem;
  background: #333399;
  color: #fff;
  text-decoration: none;
}
.btn:hover {
  background: #2a2a7a;
}
</style>

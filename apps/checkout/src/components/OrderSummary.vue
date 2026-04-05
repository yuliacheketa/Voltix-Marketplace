<template>
  <div class="page">
    <h1 class="h1">Review order</h1>
    <p class="step">Step 4 of 4</p>
    <section class="box">
      <h2 class="h2">Items</h2>
      <ul class="ul">
        <li v-for="it in items" :key="it.productId" class="li">
          <span>{{ it.title || it.productId }} × {{ it.quantity }}</span>
          <span>{{ lineTotal(it) }}</span>
        </li>
      </ul>
      <div class="row">
        <span>Delivery</span>
        <span>{{ deliveryLabel }}</span>
      </div>
      <div class="row total">
        <span>Total</span>
        <strong>{{ totalFormatted }}</strong>
      </div>
    </section>
    <p v-if="err" class="err">{{ err }}</p>
    <div class="actions">
      <router-link to="/checkout/payment" class="link">Back</router-link>
      <button type="button" class="btn" :disabled="busy" @click="place">
        {{ busy ? "Placing…" : "Place order" }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { cartStore } from "@voltix/shared-state";
import { createOrder } from "@voltix/api-client";
import { formatPrice } from "@voltix/utils";
import { checkoutFlow } from "../checkoutFlow.js";

const router = useRouter();
const items = ref([]);
const busy = ref(false);
const err = ref("");

onMounted(() => {
  items.value = [...cartStore.getState().items];
});

const deliveryFee = computed(() => checkoutFlow.delivery?.fee ?? 0);

const deliveryLabel = computed(() =>
  deliveryFee.value === 0 ? "Free" : formatPrice(deliveryFee.value, "USD")
);

const subtotal = computed(() =>
  items.value.reduce((s, i) => s + (i.unitPrice ?? 0) * i.quantity, 0)
);

const total = computed(() => subtotal.value + deliveryFee.value);

const totalFormatted = computed(() => formatPrice(total.value, "USD"));

function lineTotal(it) {
  return formatPrice((it.unitPrice ?? 0) * it.quantity, "USD");
}

async function place() {
  err.value = "";
  if (!items.value.length) {
    err.value = "Cart is empty";
    return;
  }
  busy.value = true;
  try {
    const order = await createOrder({
      items: items.value.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        title: i.title,
        unitPrice: i.unitPrice,
      })),
      currency: "USD",
    });
    router.push({
      name: "order-success",
      query: { id: order.id },
    });
  } catch (e) {
    err.value = e?.message || "Order failed";
  } finally {
    busy.value = false;
  }
}
</script>

<style scoped>
.page {
  max-width: 28rem;
  margin: 0 auto;
  padding: 1.5rem 1.25rem 3rem;
}
.h1 {
  margin: 0 0 0.35rem;
  font-size: 1.35rem;
  color: #1a1a34;
}
.step {
  margin: 0 0 1.25rem;
  font-size: 0.8125rem;
  color: #65657f;
}
.box {
  background: #fff;
  border: 1px solid #e2e2ef;
  border-radius: 0.5rem;
  padding: 1.25rem;
  margin-bottom: 1rem;
}
.h2 {
  margin: 0 0 0.75rem;
  font-size: 1rem;
  color: #1a1a34;
}
.ul {
  list-style: none;
  margin: 0 0 1rem;
  padding: 0;
}
.li {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  padding: 0.35rem 0;
  color: #3a3a58;
  border-bottom: 1px solid #f0f0f8;
}
.row {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #65657f;
  padding: 0.35rem 0;
}
.row.total {
  margin-top: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e2e2ef;
  font-size: 1rem;
  color: #1a1a34;
}
.row.total strong {
  color: #333399;
  font-size: 1.1rem;
}
.err {
  color: #b91c3c;
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
}
.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.link {
  color: #333399;
  font-size: 0.875rem;
  font-weight: 600;
}
.btn {
  font: inherit;
  font-weight: 600;
  padding: 0.55rem 1.25rem;
  border: none;
  border-radius: 0.375rem;
  background: #333399;
  color: #fff;
  cursor: pointer;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn:hover:not(:disabled) {
  background: #2a2a7a;
}
</style>

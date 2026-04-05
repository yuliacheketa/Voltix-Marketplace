<template>
  <div class="row">
    <div class="thumb" aria-hidden="true" />
    <div class="meta">
      <div class="name">{{ item.title || "Product" }}</div>
      <div class="price">{{ formattedUnit }}</div>
    </div>
    <div class="qty">
      <button type="button" class="qty-btn" @click="dec">−</button>
      <span class="qty-val">{{ item.quantity }}</span>
      <button type="button" class="qty-btn" @click="inc">+</button>
    </div>
    <button type="button" class="del" @click="remove">Remove</button>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { formatPrice } from "@voltix/utils";
import { cartStore } from "@voltix/shared-state";

const props = defineProps({
  item: { type: Object, required: true },
});

const formattedUnit = computed(() =>
  formatPrice(props.item.unitPrice ?? 0, "USD")
);

function inc() {
  cartStore.getState().addItem({
    productId: props.item.productId,
    quantity: 1,
    title: props.item.title,
    unitPrice: props.item.unitPrice,
  });
}

function dec() {
  cartStore.getState().addItem({
    productId: props.item.productId,
    quantity: -1,
    title: props.item.title,
    unitPrice: props.item.unitPrice,
  });
}

function remove() {
  cartStore.getState().removeItem(props.item.productId);
}
</script>

<style scoped>
.row {
  display: grid;
  grid-template-columns: 3.5rem 1fr auto auto;
  gap: 0.75rem;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e2e2ef;
}
.thumb {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 0.375rem;
  background: linear-gradient(135deg, #dcdcf0 0%, #ebebf7 100%);
  border: 1px solid #e2e2ef;
}
.meta {
  min-width: 0;
}
.name {
  font-weight: 600;
  color: #1a1a34;
  font-size: 0.9375rem;
}
.price {
  font-size: 0.8125rem;
  color: #65657f;
  margin-top: 0.15rem;
}
.qty {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
.qty-btn {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.25rem;
  border: 1px solid #b4b4ce;
  background: #fff;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  color: #333399;
}
.qty-btn:hover {
  background: #f3f3fa;
}
.qty-val {
  min-width: 1.5rem;
  text-align: center;
  font-weight: 600;
  font-size: 0.875rem;
}
.del {
  font-size: 0.8125rem;
  color: #b91c3c;
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
  padding: 0.25rem;
}
.del:hover {
  color: #991b1b;
}
</style>

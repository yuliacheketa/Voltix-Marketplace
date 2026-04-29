<template>
  <div class="overlay" @click.self="close">
    <aside class="panel" role="dialog" aria-label="Кошик">
      <header class="head">
        <h2 class="title">Кошик</h2>
        <button type="button" class="close" @click="close" aria-label="Закрити">
          ×
        </button>
      </header>
      <div v-if="items.length === 0" class="empty">Ваш кошик порожній.</div>
      <div v-else class="list">
        <CartItem v-for="it in items" :key="it.productId" :item="it" />
      </div>
      <footer v-if="items.length" class="foot">
        <div class="subrow">
          <span>Підсумок</span>
          <strong>{{ subtotalFormatted }}</strong>
        </div>
        <router-link to="/checkout/contact" class="checkout-btn"
          >Оформити замовлення</router-link
        >
      </footer>
    </aside>
  </div>
</template>

<script>
import { cartStore, cartTotalPrice } from "@voltix/shared-state";
import { formatPrice } from "@voltix/utils";
import CartItem from "./CartItem.vue";

export default {
  name: "CartDrawer",
  components: {
    CartItem,
  },
  data() {
    return {
      items: [],
      subtotal: 0,
      unsub: null,
    };
  },
  computed: {
    subtotalFormatted() {
      return formatPrice(this.subtotal, "USD");
    },
  },
  mounted() {
    const sync = () => {
      this.items = [...cartStore.getState().items];
      this.subtotal = cartTotalPrice();
    };

    sync();
    this.unsub = cartStore.subscribe(sync);
  },
  beforeDestroy() {
    if (typeof this.unsub === "function") this.unsub();
  },
  methods: {
    close() {
      this.$router.back();
    },
  },
};
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
  font-size: 1.15rem;
  color: #1a1a34;
}
.close {
  border: none;
  background: transparent;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  color: #65657f;
  padding: 0.25rem;
}
.close:hover {
  color: #1a1a34;
}
.empty {
  padding: 2rem 1.25rem;
  color: #65657f;
  font-size: 0.9375rem;
}
.list {
  flex: 1;
  overflow-y: auto;
  padding: 0 1rem;
}
.foot {
  padding: 1rem 1.25rem;
  border-top: 1px solid #e2e2ef;
  background: #fafaff;
}
.subrow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 0.9375rem;
  color: #3a3a58;
}
.checkout-btn {
  display: block;
  text-align: center;
  font-weight: 600;
  padding: 0.65rem 1rem;
  border-radius: 0.375rem;
  background: #333399;
  color: #fff;
  text-decoration: none;
  font-size: 0.9375rem;
}
.checkout-btn:hover {
  background: #2a2a7a;
}
</style>

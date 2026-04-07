<template>
  <div class="page">
    <h1 class="h1">Доставка</h1>
    <p class="step">Крок 2 з 4</p>
    <form class="form" @submit.prevent="next">
      <label
        v-for="opt in options"
        :key="opt.id"
        class="card"
        :class="{ on: selected === opt.id }"
      >
        <input
          v-model="selected"
          type="radio"
          name="delivery"
          :value="opt.id"
          class="rad"
        />
        <div class="card-body">
          <div class="card-title">{{ opt.label }}</div>
          <div class="card-meta">
            {{ opt.fee === 0 ? "Безкоштовно" : formatPrice(opt.fee, "USD") }} ·
            орієнт. {{ opt.eta }}
          </div>
        </div>
      </label>
      <div class="actions">
        <router-link to="/checkout/contact" class="link">Назад</router-link>
        <button type="submit" class="btn">Далі</button>
      </div>
    </form>
  </div>
</template>

<script>
import { formatPrice } from "@voltix/utils";
import { checkoutFlow } from "../checkoutFlow.js";

export default {
  name: "DeliveryOptions",
  data() {
    return {
      selected: "standard",
    };
  },
  computed: {
    options() {
      const addDays = (n) => {
        const d = new Date();
        d.setDate(d.getDate() + n);
        return d.toLocaleDateString("uk-UA", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      };

      return [
        {
          id: "standard",
          label: "Стандартна доставка",
          fee: 0,
          eta: addDays(5),
        },
        {
          id: "express",
          label: "Експрес",
          fee: 9.99,
          eta: addDays(2),
        },
        {
          id: "pickup",
          label: "Самовивіз з магазину",
          fee: 0,
          eta: "завтра",
        },
      ];
    },
  },
  methods: {
    formatPrice,
    next() {
      const opt = this.options.find((o) => o.id === this.selected);
      if (!opt) return;

      checkoutFlow.delivery = {
        method: opt.id,
        label: opt.label,
        fee: opt.fee,
        etaLabel: opt.eta,
      };

      this.$router.push({ name: "checkout-payment" });
    },
  },
};
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
.form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.card {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 2px solid #e2e2ef;
  cursor: pointer;
  background: #fff;
}
.card.on {
  border-color: #333399;
  background: #f5f5fb;
}
.rad {
  margin-top: 0.2rem;
  accent-color: #333399;
}
.card-body {
  flex: 1;
}
.card-title {
  font-weight: 600;
  color: #1a1a34;
}
.card-meta {
  font-size: 0.8125rem;
  color: #65657f;
  margin-top: 0.25rem;
}
.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
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
.btn:hover {
  background: #2a2a7a;
}
</style>

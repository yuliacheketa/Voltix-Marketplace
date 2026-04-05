<template>
  <div class="page">
    <h1 class="h1">Payment</h1>
    <p class="step">Step 3 of 4</p>
    <form class="form" @submit.prevent="onSubmit">
      <label class="lbl">
        Card number
        <IMaskComponent
          v-model="cardNumber"
          :mask="'0000 0000 0000 0000'"
          class="inp"
          inputmode="numeric"
          autocomplete="cc-number"
        />
        <span v-if="cardErr" class="err">{{ cardErr }}</span>
      </label>
      <div class="row2">
        <label class="lbl">
          Expiry (MM/YY)
          <IMaskComponent
            v-model="expiry"
            :mask="'00/00'"
            class="inp"
            inputmode="numeric"
            autocomplete="cc-exp"
          />
          <span v-if="expiryErr" class="err">{{ expiryErr }}</span>
        </label>
        <label class="lbl">
          CVV
          <IMaskComponent
            v-model="cvv"
            :mask="'000'"
            class="inp"
            inputmode="numeric"
            autocomplete="cc-csc"
          />
          <span v-if="cvvErr" class="err">{{ cvvErr }}</span>
        </label>
      </div>
      <div class="actions">
        <router-link to="/checkout/delivery" class="link">Back</router-link>
        <button type="submit" class="btn">Continue</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { IMaskComponent } from "vue-imask";
import { isValidCard } from "@voltix/utils";
import { checkoutFlow } from "../checkoutFlow.js";

const router = useRouter();
const cardNumber = ref("");
const expiry = ref("");
const cvv = ref("");
const cardErr = ref("");
const expiryErr = ref("");
const cvvErr = ref("");

function onSubmit() {
  cardErr.value = "";
  expiryErr.value = "";
  cvvErr.value = "";
  const digits = cardNumber.value.replace(/\D/g, "");
  if (!isValidCard(digits)) {
    cardErr.value = "Invalid card number";
    return;
  }
  const exp = expiry.value.replace(/\D/g, "");
  if (exp.length !== 4) {
    expiryErr.value = "Use MM/YY";
    return;
  }
  const cv = cvv.value.replace(/\D/g, "");
  if (cv.length < 3) {
    cvvErr.value = "Invalid CVV";
    return;
  }
  checkoutFlow.payment = {
    last4: digits.slice(-4),
    expiry: expiry.value,
  };
  router.push({ name: "checkout-summary" });
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
.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.lbl {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #3a3a58;
}
.inp {
  font: inherit;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid #b4b4ce;
  background: #fff;
  color: #1a1a34;
  width: 100%;
  box-sizing: border-box;
}
.inp:focus {
  outline: 2px solid #333399;
  outline-offset: 0;
  border-color: #333399;
}
.err {
  font-size: 0.75rem;
  font-weight: 500;
  color: #b91c3c;
}
.row2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
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

<template>
  <div class="page">
    <h1 class="h1">Контакти та доставка</h1>
    <p class="step">Крок 1 з 4</p>
    <form class="form" @submit.prevent="onSubmit">
      <label class="lbl">
        Повне імʼя
        <input
          v-model="fullName"
          v-bind="fullNameAttrs"
          type="text"
          class="inp"
          autocomplete="name"
        />
        <span v-if="errors.fullName" class="err">{{ errors.fullName }}</span>
      </label>
      <label class="lbl">
        Електронна пошта
        <input
          v-model="email"
          v-bind="emailAttrs"
          type="email"
          class="inp"
          autocomplete="email"
        />
        <span v-if="errors.email" class="err">{{ errors.email }}</span>
      </label>
      <label class="lbl">
        Телефон
        <IMaskComponent
          v-model="phone"
          v-bind="phoneAttrs"
          :mask="'(000) 000-0000'"
          class="inp"
          inputmode="tel"
          autocomplete="tel"
        />
        <span v-if="errors.phone" class="err">{{ errors.phone }}</span>
      </label>
      <label class="lbl">
        Вулиця, будинок
        <input
          v-model="street"
          v-bind="streetAttrs"
          type="text"
          class="inp"
          autocomplete="street-address"
        />
        <span v-if="errors.street" class="err">{{ errors.street }}</span>
      </label>
      <div class="row2">
        <label class="lbl">
          Місто
          <input v-model="city" v-bind="cityAttrs" type="text" class="inp" />
          <span v-if="errors.city" class="err">{{ errors.city }}</span>
        </label>
        <label class="lbl">
          Індекс
          <input v-model="zip" v-bind="zipAttrs" type="text" class="inp" />
          <span v-if="errors.zip" class="err">{{ errors.zip }}</span>
        </label>
      </div>
      <label class="lbl">
        Країна
        <input
          v-model="country"
          v-bind="countryAttrs"
          type="text"
          class="inp"
          autocomplete="country-name"
        />
        <span v-if="errors.country" class="err">{{ errors.country }}</span>
      </label>
      <div class="actions">
        <router-link to="/cart" class="link">Назад до кошика</router-link>
        <button type="submit" class="btn">Далі</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/yup";
import * as yup from "yup";
import { useRouter } from "vue-router";
import { IMaskComponent } from "vue-imask";
import { isValidEmail, isValidPhone } from "@voltix/utils";
import { checkoutFlow } from "../checkoutFlow.js";

const router = useRouter();

const schema = toTypedSchema(
  yup.object({
    fullName: yup.string().required("Обовʼязково"),
    email: yup
      .string()
      .required("Обовʼязково")
      .test("em", "Некоректний email", (v) => isValidEmail(v || "")),
    phone: yup
      .string()
      .required("Обовʼязково")
      .test("ph", "Некоректний телефон", (v) => isValidPhone(v || "")),
    street: yup.string().required("Обовʼязково"),
    city: yup.string().required("Обовʼязково"),
    zip: yup.string().required("Обовʼязково"),
    country: yup.string().required("Обовʼязково"),
  })
);

const { handleSubmit, errors, defineField } = useForm({
  validationSchema: schema,
});

const [fullName, fullNameAttrs] = defineField("fullName");
const [email, emailAttrs] = defineField("email");
const [phone, phoneAttrs] = defineField("phone");
const [street, streetAttrs] = defineField("street");
const [city, cityAttrs] = defineField("city");
const [zip, zipAttrs] = defineField("zip");
const [country, countryAttrs] = defineField("country");

const onSubmit = handleSubmit((vals) => {
  checkoutFlow.contact = { ...vals };
  router.push({ name: "checkout-delivery" });
});
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

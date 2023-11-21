import { ref } from 'vue';
import { defineStore } from 'pinia';
import userServce from '@/services/user.service.js';

export const useOrderStore = defineStore('order', () => {
  const order = ref({
    user: {},
    orderItems: [],
  });

  async function createOrder(data) {
    order.value.user = (await userServce.getMe()).data;
    order.value.shippingAddress = order.value.user.address || '';
    order.value.telephone = order.value.user.telephone || '';
    order.value.fullname = order.value.user.fullname || '';
    order.value.orderItems = data;
  }

  function getOrder() {
    return order.value;
  }

  return { order, createOrder, getOrder };
});


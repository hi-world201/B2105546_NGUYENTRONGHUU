<template>
  <div class="d-flex jusitfy-content-center align-items-center">
    <select
      v-model="status"
      class="form-select form-select-md"
      aria-label=".form-select-md"
    >
      <option value="" selected>Tất cả đơn hàng</option>
      <option value="pending">Đang chờ xử lý</option>
      <option value="accepted">Đã xác nhận</option>
      <option value="shipping">Đang giao hàng</option>
      <option value="delivered">Đã giao hàng</option>
      <option value="cancelled">Đã hủy</option>
    </select>
    <input
      type="search"
      class="form-control ms-2"
      placeholder="Tìm theo mã đơn"
      v-model="orderId"
    />
    <button class="btn btn-md btn-outline-dark ms-3" @click="onSubmit">
      Lọc
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const emits = defineEmits(['filter-order']);
const router = useRouter();
const status = ref('');
const orderId = ref('');

async function onSubmit() {
  await router.push({
    name: 'order-list',
    query: {
      currentStatus: status.value ? status.value : undefined,
      _id: orderId.value ? orderId.value : undefined,
    },
  });
  emits('filter-order');
}
</script>


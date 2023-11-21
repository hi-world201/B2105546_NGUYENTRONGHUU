<template>
  <div>
    <div class="container mt-3">
      <router-link :to="{ name: 'user-list' }">
        <i class="fa-solid fa-arrow-left-long"></i> Trở lại trang danh sách
      </router-link>
    </div>
    <div class="container p-5">
      <Form class="form" @submit="onSubmit" :validation-schema="userFormSchema">
        <legend class="form-title">Thêm tài khoản mới</legend>
        <div class="mb-3 form-group">
          <label for="email" class="form-label">Email: </label>
          <Field
            type="text"
            name="email"
            id="email"
            class="form-control"
            v-model="user.email"
          />
          <ErrorMessage name="email" class="error-feedback"></ErrorMessage>
        </div>
        <div class="mb-3 form-group">
          <label for="password" class="form-label">Mật khẩu: </label>
          <Field
            type="text"
            name="password"
            id="password"
            class="form-control"
            v-model="user.password"
          />
          <ErrorMessage name="password" class="error-feedback"></ErrorMessage>
        </div>
        <div class="mb-3 form-group">
          <label for="fullname" class="form-label">Họ và tên: </label>
          <Field
            type="text"
            name="fullname"
            id="fullname"
            class="form-control"
            v-model="user.fullname"
          />
          <ErrorMessage name="fullname" class="error-feedback"></ErrorMessage>
        </div>
        <div class="mb-3 form-group">
          <label for="telephone" class="form-label">Số điện thoại: </label>
          <Field
            type="text"
            name="telephone"
            id="telephone"
            class="form-control"
            v-model="user.telephone"
          />
          <ErrorMessage name="telephone" class="error-feedback"></ErrorMessage>
        </div>
        <div class="mb-3 form-group">
          <label for="address" class="form-label">Địa chỉ: </label>
          <Field
            name="address"
            id="address"
            class="form-control"
            v-model="user.address"
          />
          <ErrorMessage name="address" class="error-feedback"></ErrorMessage>
        </div>
        <div class="mb-3 form-group">
          <label for="role" class="form-label">Vai trò: </label>
          <Field
            as="select"
            name="role"
            id="role"
            class="form-control"
            v-model="user.role"
          >
            <option value="admin">Quản trị viên</option>
            <option value="staff">Nhân viên</option>
            <option value="customer">Khách hàng</option>
          </Field>
          <ErrorMessage name="role" class="error-feedback"></ErrorMessage>
        </div>
        <div class="mb-3 form-group">
          <Field v-slot="{ field }" name="active" type="checkbox">
            <label>
              <input type="checkbox" name="active" v-model="user.active" />
              Active
            </label>
          </Field>
          <ErrorMessage name="is-active" class="error-feedback"></ErrorMessage>
        </div>
        <div class="mb-3 form-group">
          <button
            class="btn btn-outline-dark btn-md"
            type="submit"
            :disabled="loading"
          >
            Thêm mới
            <span
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
              v-if="loading"
            ></span>
          </button>
        </div>
      </Form>
    </div>
  </div>
</template>

<script setup>
import '@/assets/css/form.css';
import { ref } from 'vue';
import { Field, Form, ErrorMessage } from 'vee-validate';
import * as yup from 'yup';
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router';
import userService from '@/services/user.service';
import Swal from 'sweetalert2';

const router = useRouter();
const route = useRoute();
const isAdd = ref(false);
const loading = ref(false);
const user = ref({
  email: '',
  password: '',
  fullname: '',
  telephone: '',
  address: '',
  role: 'customer',
  active: true,
});

const userFormSchema = yup.object({
  email: yup
    .string()
    .required('Email không được để trống')
    .email('Email không hợp lệ'),
  fullname: yup.string(),
  password: yup.string().min('8', 'Mật khẩu phải có ít nhất 8 ký tự'),
  telephone: yup.string().required('Số điện thoại không được để trống'),
  address: yup.string(),
  role: yup.string().required('Vai trò không được để trống'),
  active: yup.boolean('Active không hợp lệ'),
});

async function onSubmit() {
  const result = await Swal.fire({
    title: 'Xác nhận',
    text: 'Bạn có chắc chắn muốn thêm tài khoản?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Xác nhận',
    cancelButtonText: 'Tiếp tục chỉnh sửa',
    reverseButtons: false,
  });

  if (!result.isConfirmed) {
    return;
  }

  loading.value = true;

  user.value.confirmPassword = user.value.password;

  // Update user
  const response = await userService.createUser(user.value);

  if (response.status === 'success') {
    await Swal.fire({
      title: 'Thành công',
      text: 'Thêm tài khoản thành công!',
      icon: 'success',
    });
    isAdd.value = true;
    router.push({ name: 'user-list' });
  } else {
    const result = await Swal.fire({
      title: 'Thất bại',
      text: `Lỗi khi thêm tài khoản! ${
        response.message.includes('email') ? 'Email đã tồn tại' : ''
      }`,
      icon: 'error',
    });
  }

  loading.value = false;
}

onBeforeRouteLeave(async () => {
  if (isAdd.value) return true;
  const result = await Swal.fire({
    title: 'Xác nhận',
    text: 'Thông tin chưa được lưu. Bạn có chắc chắn muốn rời khỏi trang?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Xác nhận',
    cancelButtonText: 'Tiếp tục chỉnh sửa',
    reverseButtons: false,
  });

  return result.isConfirmed;
});
</script>

<style scoped>
.form {
  max-width: 800px;
  margin: 0 auto;
}
.description {
  font-size: 14px;
  height: 200px;
}
</style>


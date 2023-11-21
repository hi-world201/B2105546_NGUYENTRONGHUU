import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import userService from '@/services/user.service.js';

export const useUserStore = defineStore('user', () => {
  const email = ref('');
  const role = ref('');
  //   const photo = ref('');

  const isAuth = computed(() => {
    return email.value !== '' && role.value !== '';
  });

  async function login(data) {
    try {
      const response = data
        ? await userService.login(data)
        : await userService.getMe();

      if (response.data.role === 'customer') {
        email.value = response.data.email;
        role.value = response.data.role;
        // photo.value = response.user.photo;
      }
    } catch (err) {
      email.value = '';
      role.value = '';
      //   photo.value = '';
    }
  }

  async function logout() {
    await userService.logout();
    email.value = '';
    role.value = '';
    // photo.value = '';
  }

  return { email, role, isAuth, login, logout };
});


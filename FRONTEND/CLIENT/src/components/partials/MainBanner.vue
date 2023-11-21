<template>
  <div
    class="text-light banner d-flex flex-column justify-content-center align-items-center"
  >
    <h2 class="banner-text">Chào mừng bạn đến với Hiworld Bookstore</h2>
    <p class="banner-description">
      Bắt đầu cuộc hành trình khám phá văn hóa từ những trang sách với một không
      gian rộng lớn, từ thế giới giả tưởng, kiến thức khoa học cho đến kho tàng
      văn học khổng lồ. Không chỉ được khám phá những bức tranh kinh điển mà còn
      mở cửa sổ tâm hồn với những câu truyện đương đại nổi bật, đưa bạn đến
      những thế giới mới lạ, nơi những ý tưởng sáng tạo nảy mầm. Hãy để chúng
      tôi là nguồn cảm hứng cho cuộc phiêu lưu văn chương của bạn.
    </p>
    <div>
      <router-link :to="{ name: 'product-page' }" class="btn btn-outline-light"
        >Khám phá ngay</router-link
      >
      <router-link
        :to="{ name: 'register-page' }"
        class="btn btn-outline-light ms-3"
        v-if="!store.isAuth"
        >Đăng ký ngay</router-link
      >
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/user.js';

const store = useUserStore();
</script>

<style scoped>
.banner {
  background: linear-gradient(to top, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)),
    url('@/assets/img/banner.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  height: 90vh;
  position: relative;
}

.banner-text {
  padding: 0 50px;
  font-weight: 600;
  font-size: 50px;
}

.banner-description {
  padding: 0 50px;
  font-size: 24px;
}

.banner-text + .banner-description {
  margin-top: 20px;
}
</style>


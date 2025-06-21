<template>
  <div class="page-container">
    <LoginForm />
  </div>
</template>

<script setup lang="ts">
import LoginForm from '../components/LoginForm.vue'
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f3f4f6; /* gris claro */
  padding: 20px;
}

.page-container > * {
  max-width: 450px;
  width: 100%;
}
</style>

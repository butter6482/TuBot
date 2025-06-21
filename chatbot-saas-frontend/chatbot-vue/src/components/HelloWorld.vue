<script setup lang="ts">
defineProps<{ msg: string }>()
</script>

<template>
  <div>
    <h1>{{ msg }}</h1>
    <p>¡Hola! Esto es un mensaje simple desde HelloWorld.vue</p>
  </div>
</template>

<style scoped>
h1 {
  color: #42b983;
}
</style>

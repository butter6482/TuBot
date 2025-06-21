<template>
  <div class="container">
    <form class="form" @submit.prevent="handleRegister">
      <div class="flex-column">
        <label>Email</label>
        <input v-model="email" type="email" placeholder="Enter your Email" />
      </div>

      <div class="flex-column">
        <label>Password</label>
        <input v-model="password" type="password" placeholder="Enter your Password" />
      </div>

      <button type="submit">Registrarse</button>

      <p v-if="errorMessage" style="color: red">{{ errorMessage }}</p>
      <p v-if="successMessage" style="color: green">{{ successMessage }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '@/lib/supabaseClient' // asegúrate de tener este archivo bien configurado

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const successMessage = ref('')

async function handleRegister() {
  errorMessage.value = ''
  successMessage.value = ''

  const { data, error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
  })

  if (error) {
    errorMessage.value = error.message
  } else {
    successMessage.value = 'Usuario creado. Revisa tu email para confirmar tu cuenta.'
  }
}
</script>

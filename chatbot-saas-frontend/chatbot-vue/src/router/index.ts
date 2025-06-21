// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import LoginForm from '@/components/LoginForm.vue'
import Dashboard from '@/views/Dashboard.vue'

const routes = [
  { path: '/', name: 'Login', component: LoginForm },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard }
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

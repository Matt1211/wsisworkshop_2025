<template>
  <div class="p-4">
    <h1 class="text-3xl font-bold mb-4">Welcome to Vue with Flowbite</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Flowbite Card Component -->
      <FbCard>
        <template #img>
          <img src="https://flowbite.com/docs/images/blog/image-1.jpg" alt="Card image">
        </template>
        <h5 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Flowbite Card Example
        </h5>
        <p class="font-normal text-gray-700 dark:text-gray-400">
          This is a sample card component from Flowbite, demonstrating the integration.
        </p>
      </FbCard>

      <!-- Flowbite Button Examples -->
      <div class="space-y-4">
        <FbButton color="blue">
          Primary Button
        </FbButton>
        
        <FbButton color="green">
          Success Button
        </FbButton>
        
        <FbButton color="red">
          Danger Button
        </FbButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FbButton, FbCard } from 'flowbite-vue'
</script>

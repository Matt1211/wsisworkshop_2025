<template>
  <fwb-modal v-if="isVisible" @close="$emit('close')">
    <template #header>
      <div class="flex items-center text-lg">
        {{ meal.name }} Details
      </div>
    </template>
    <template #body>
      <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400 mb-4">
        {{ meal.description }}
      </p>
      <div v-for="food in meal.foods" :key="food.id" class="mb-4 p-3 border rounded-lg dark:border-gray-600">
          <h4 class="font-bold text-gray-900 dark:text-white">{{ food.description }}</h4>
          <ul class="mt-2 text-sm">
              <li v-for="(value, key) in food.nutrients" :key="key" class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-300">{{ key }}</span>
                  <span class="font-semibold text-gray-800 dark:text-gray-200">{{ value }}</span>
              </li>
          </ul>
           <div class="text-right mt-2">
            <button @click="removeFoodFromMeal(meal.id, food.id)" class="text-xs text-red-500 hover:underline">Remove Item</button>
          </div>
      </div>
      <div v-if="!meal.foods.length" class="text-center text-gray-500 italic">
          This meal has no food items. Add some from the uploader!
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end">
        <fwb-button @click="$emit('close')" color="alternative">
          Close
        </fwb-button>
      </div>
    </template>
  </fwb-modal>
</template>

<script setup>
import { FwbModal, FwbButton } from 'flowbite-vue'
import { useMeals } from '@/composables/useMeals';

defineProps({
  isVisible: Boolean,
  meal: Object,
});

defineEmits(['close']);

const { removeFoodFromMeal } = useMeals();
</script>
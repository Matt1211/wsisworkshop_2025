<template>
  <fwb-card>
    <div class="p-5">
      <div class="flex justify-between items-start">
        <div>
          <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {{ meal.name }}
          </h5>
          <p class="font-normal text-gray-700 dark:text-gray-400">
            {{ meal.description }}
          </p>
        </div>
        <fwb-button color="red" @click="$emit('remove')">Remove</fwb-button>
      </div>

      <div class="mt-4">
        <h6 class="font-semibold dark:text-white">Foods ({{ meal.foods.length }}/5)</h6>
        <ul v-if="meal.foods.length" class="list-disc list-inside text-gray-600 dark:text-gray-300">
          <li v-for="food in meal.foods" :key="food.id">{{ food.description }}</li>
        </ul>
        <p v-else class="text-sm text-gray-500 italic">No food items added yet.</p>
      </div>
      
      <div class="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h6 class="font-semibold dark:text-white mb-2">Meal Totals</h6>
          <div class="grid grid-cols-2 gap-2 text-sm">
              <div v-for="(value, key) in totalNutrition" :key="key">
                  <span class="font-medium text-gray-800 dark:text-gray-200">{{ key }}:</span>
                  <span class="text-gray-600 dark:text-gray-400 ml-2">{{ value }}</span>
              </div>
          </div>
      </div>
      
      <div class="mt-4">
          <fwb-button @click="$emit('view-details')">View Details</fwb-button>
      </div>
    </div>
  </fwb-card>
</template>

<script setup>
import { FwbCard, FwbButton } from 'flowbite-vue';
import { useMeals } from '@/composables/useMeals';

const props = defineProps({
  meal: {
    type: Object,
    required: true
  }
});

defineEmits(['remove', 'view-details']);

const { getMealTotals } = useMeals();
const totalNutrition = getMealTotals(props.meal.id);
</script>
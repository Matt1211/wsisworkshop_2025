<template>
  <div class="p-4 md:p-8">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <div class="lg:col-span-1">
        <fwb-card class="p-4 mb-8">
            <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">Create a New Meal</h2>
            <div class="space-y-4">
                <fwb-input v-model="newMeal.name" placeholder="e.g., Monday Lunch" label="Meal Name" />
                <fwb-input v-model="newMeal.description" placeholder="e.g., A light and healthy lunch" label="Description" />
                <fwb-button @click="handleAddNewMeal" class="w-full" :disabled="meals.length >= 5">
                    Add New Meal
                </fwb-button>
                <p v-if="meals.length >= 5" class="text-sm text-red-500 text-center">You can only have a maximum of 5 meals.</p>
            </div>
        </fwb-card>

        <ImageUploader />
      </div>

      <div class="lg:col-span-2">
        <div class="flex justify-between items-center mb-4">
            <h1 class="text-3xl font-bold text-gray-800 dark:text-white">My Meals</h1>
            <fwb-button @click="exportMealsToCSV" :disabled="!meals.length">
                Export to CSV
            </fwb-button>
        </div>
        
        <div v-if="!meals.length" class="text-center py-16 border-2 border-dashed rounded-lg">
            <p class="text-gray-500">You haven't created any meals yet.</p>
            <p class="text-gray-500">Use the form on the left to get started.</p>
        </div>
        
        <div v-else class="space-y-6">
            <MealCard 
                v-for="meal in meals" 
                :key="meal.id" 
                :meal="meal"
                @remove="removeMeal(meal.id)"
                @view-details="openDetailModal(meal)"
            />
        </div>
      </div>

    </div>
    
    <MealDetailModal 
        :is-visible="isModalVisible"
        :meal="selectedMeal"
        @close="closeDetailModal"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { FwbButton, FwbCard, FwbInput } from 'flowbite-vue';
import { useMeals } from '@/composables/useMeals.js';
import ImageUploader from './ImageUploader.vue';
import MealCard from './MealCard.vue';
import MealDetailModal from './MealDetailModal.vue';

const { meals, addMeal, removeMeal, exportMealsToCSV } = useMeals();

// For the meal creation form
const newMeal = reactive({ name: '', description: '' });

const handleAddNewMeal = () => {
    addMeal(newMeal.name, newMeal.description);
    // Reset form
    newMeal.name = '';
    newMeal.description = '';
};

// For the detail modal
const isModalVisible = ref(false);
const selectedMeal = ref(null);

const openDetailModal = (meal) => {
    selectedMeal.value = meal;
    isModalVisible.value = true;
};
const closeDetailModal = () => {
    isModalVisible.value = false;
};
</script>
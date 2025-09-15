<template>
  <fwb-card class="p-4">
    <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">Identify a New Food Item</h2>
    
    <fwb-file-input v-model="selectedFile" dropzone label="Upload Food Photo" />
    
    <div v-if="imagePreviewUrl" class="mt-4 text-center">
      <img :src="imagePreviewUrl" class="rounded-lg max-h-64 mx-auto" alt="Image preview" />
    </div>

    <div class="text-center mt-4">
      <fwb-button @click="handleSubmit" :disabled="!selectedFile || isLoading" :loading="isLoading">
        {{ isLoading ? 'Analyzing...' : 'Identify Food' }}
      </fwb-button>
    </div>

    <fwb-alert v-if="errorMessage" type="danger" class="mt-4">
      {{ errorMessage }}
    </fwb-alert>
    
    <div v-if="nutritionalData" class="mt-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
        <h3 class="font-bold text-lg dark:text-white">{{ nutritionalData.description }}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">Successfully identified!</p>
        <div class="mt-2">
            <label for="meal-select" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Add to an existing meal:</label>
            <select v-model="selectedMealId" id="meal-select" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                <option disabled value="">Please select one</option>
                <option v-for="meal in meals" :key="meal.id" :value="meal.id">
                    {{ meal.name }}
                </option>
            </select>
            <fwb-button @click="handleAddToMeal" :disabled="!selectedMealId" class="mt-2 w-full">
                Add to Selected Meal
            </fwb-button>
        </div>
    </div>
  </fwb-card>
</template>

<script setup>
import { ref, watch } from 'vue';
import { FwbFileInput, FwbButton, FwbAlert, FwbCard } from 'flowbite-vue';
import { getFoodDataFromImage } from '@/services/mockApi'; // The mock API call
import { useMeals } from '@/composables/useMeals';

const { meals, addFoodToMeal } = useMeals();

const selectedFile = ref(null);
const imagePreviewUrl = ref(null);
const isLoading = ref(false);
const nutritionalData = ref(null);
const errorMessage = ref(null);
const selectedMealId = ref('');

// Watch for file changes to generate a preview
watch(selectedFile, (newFile) => {
  if (newFile) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreviewUrl.value = e.target.result;
    };
    reader.readAsDataURL(newFile);
  } else {
    imagePreviewUrl.value = null;
  }
  // Reset state when file changes
  nutritionalData.value = null;
  errorMessage.value = null;
});

// Handle the API submission
const handleSubmit = async () => {
  if (!selectedFile.value) return;

  isLoading.value = true;
  errorMessage.value = null;
  nutritionalData.value = null;

  try {
    const data = await getFoodDataFromImage(selectedFile.value);
    nutritionalData.value = data;
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    isLoading.value = false;
  }
};

// Add the identified food to the selected meal
const handleAddToMeal = () => {
    if (!selectedMealId.value || !nutritionalData.value) return;
    
    addFoodToMeal(selectedMealId.value, nutritionalData.value);
    
    // Reset the uploader for the next item
    nutritionalData.value = null;
    selectedFile.value = null;
    selectedMealId.value = '';
};
</script>
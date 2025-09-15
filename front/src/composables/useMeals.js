// src/composables/useMeals.js

import { ref, computed } from 'vue';

// The global state for our meals
const meals = ref([]);

export function useMeals() {

  // Function to add a new meal
  const addMeal = (name, description) => {
    if (!name || meals.value.length >= 5) return;
    meals.value.push({
      id: Date.now(),
      name,
      description,
      foods: [],
    });
  };

  // Function to remove a meal by its ID
  const removeMeal = (mealId) => {
    meals.value = meals.value.filter(meal => meal.id !== mealId);
  };

  // Function to add a food item to a specific meal
  const addFoodToMeal = (mealId, foodData) => {
    const meal = meals.value.find(m => m.id === mealId);
    if (meal && meal.foods.length < 5) {
      meal.foods.push(foodData);
    }
  };
  
  // Function to remove a food item from a meal
  const removeFoodFromMeal = (mealId, foodId) => {
    const meal = meals.value.find(m => m.id === mealId);
    if(meal) {
        meal.foods = meal.foods.filter(f => f.id !== foodId);
    }
  };

  // A computed property to get total nutrition for a specific meal
  const getMealTotals = (mealId) => {
    return computed(() => {
      const meal = meals.value.find(m => m.id === mealId);
      if (!meal) return {};

      const totals = {
        Calories: 0, Protein: 0, TotalFat: 0, Carbohydrates: 0, Sugars: 0, Fiber: 0,
      };

      meal.foods.forEach(food => {
        totals.Calories += parseFloat(food.nutrients.Calories) || 0;
        totals.Protein += parseFloat(food.nutrients.Protein) || 0;
        totals.TotalFat += parseFloat(food.nutrients.TotalFat) || 0;
        totals.Carbohydrates += parseFloat(food.nutrients.Carbohydrates) || 0;
        totals.Sugars += parseFloat(food.nutrients.Sugars) || 0;
        totals.Fiber += parseFloat(food.nutrients.Fiber) || 0;
      });

      // Format to 2 decimal places
      for (const key in totals) {
        totals[key] = totals[key].toFixed(2);
      }
      
      return {
        Calories: `${totals.Calories} Kcal`,
        Protein: `${totals.Protein} g`,
        TotalFat: `${totals.TotalFat} g`,
        Carbohydrates: `${totals.Carbohydrates} g`,
        Sugars: `${totals.Sugars} g`,
        Fiber: `${totals.Fiber} g`,
      };
    });
  };

  // Function to export meals data to a CSV file
  const exportMealsToCSV = () => {
    if (meals.value.length === 0) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Meal Name,Meal Description,Food Item,Calories (Kcal),Protein (g),Fat (g),Carbs (g),Sugars (g),Fiber (g)\r\n";

    meals.value.forEach(meal => {
      if (meal.foods.length === 0) {
        csvContent += `${meal.name},${meal.description},No food items\r\n`;
      } else {
        meal.foods.forEach(food => {
          const row = [
            meal.name,
            meal.description,
            food.description,
            parseFloat(food.nutrients.Calories) || 0,
            parseFloat(food.nutrients.Protein) || 0,
            parseFloat(food.nutrients.TotalFat) || 0,
            parseFloat(food.nutrients.Carbohydrates) || 0,
            parseFloat(food.nutrients.Sugars) || 0,
            parseFloat(food.nutrients.Fiber) || 0,
          ].join(",");
          csvContent += row + "\r\n";
        });
      }
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "my_meals.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    meals: computed(() => meals.value), // Expose a read-only computed property
    addMeal,
    removeMeal,
    addFoodToMeal,
    removeFoodFromMeal,
    getMealTotals,
    exportMealsToCSV,
  };
}
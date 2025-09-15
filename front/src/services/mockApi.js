// src/services/mockApi.js

// This function simulates calling the backend API.
// It takes a file, pretends to process it, and returns mock nutrition data.
export const getFoodDataFromImage = async (file) => {
  console.log("Uploading image to mock API:", file.name);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // In a real app, the backend would identify the food. Here, we'll just randomize it.
  const possibleFoods = [
    {
      description: "APPLE, RAW, FUJI",
      nutrients: {
        Calories: "58 Kcal",
        Protein: "0.27 g",
        TotalFat: "0.13 g",
        Carbohydrates: "14.2 g",
        Sugars: "10.59 g",
        Fiber: "2.3 g",
      }
    },
    {
      description: "BANANA, RAW",
      nutrients: {
        Calories: "89 Kcal",
        Protein: "1.09 g",
        TotalFat: "0.33 g",
        Carbohydrates: "22.84 g",
        Sugars: "12.23 g",
        Fiber: "2.6 g",
      }
    },
    {
      description: "CHICKEN BREAST, OVEN-ROASTED",
      nutrients: {
        Calories: "165 Kcal",
        Protein: "31.02 g",
        TotalFat: "3.57 g",
        Carbohydrates: "0 g",
        Sugars: "0 g",
        Fiber: "0 g",
      }
    },
  ];

  // Randomly return success or an error
  if (Math.random() > 0.1) { // 90% chance of success
    const randomFood = possibleFoods[Math.floor(Math.random() * possibleFoods.length)];
    // Add a unique ID to each food item
    return { ...randomFood, id: Date.now() };
  } else { // 10% chance of error
    throw new Error("Could not identify any food items in the image.");
  }
};
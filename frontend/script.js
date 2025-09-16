document.addEventListener('DOMContentLoaded', () => {

    // ============================================= //
    // =============== STATE MANAGEMENT ============== //
    // ============================================= //
    let meals = [];
    let currentMeal = {
        id: null,
        name: '',
        description: '',
        foods: [],
        totalNutrition: { calories: 0, protein: 0, fat: 0, carbs: 0 }
    };
    let activeMealId = null;
    let isEditMode = false;

    // ============================================= //
    // ================ DOM SELECTORS ================ //
    // ============================================= //
    // Modal Elements
    const mealModal = document.getElementById('meal-modal');
    const modalTitle = document.getElementById('modal-title');
    const closeModalBtn = document.getElementById('close-modal');
    const cancelMealBtn = document.getElementById('cancel-meal-btn');
    const mealList = document.getElementById('meal-list');
    const emptyMealListMessage = document.getElementById('empty-meal-list');
    const newMealBtn = document.getElementById('new-meal-btn');
    const saveMealBtn = document.getElementById('save-meal-btn');
    const exportBtn = document.getElementById('export-btn');

    // Meal Creator View Elements
    const mealCreatorView = document.getElementById('meal-creator-view');
    const mealNameInput = document.getElementById('meal-name');
    const mealDescriptionInput = document.getElementById('meal-description');
    const uploadTriggerBtn = document.getElementById('upload-trigger-btn');
    const imageUploadInput = document.getElementById('image-upload-input');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imagePreview = document.getElementById('image-preview');
    const analyzeImageBtn = document.getElementById('analyze-image-btn');
    const loader = document.getElementById('loader');
    const currentMealFoodsList = document.getElementById('food-item-list');
    
    // Total Nutrition Display
    const totalCaloriesEl = document.getElementById('total-calories');
    const totalProteinEl = document.getElementById('total-protein');
    const totalFatEl = document.getElementById('total-fat');
    const totalCarbsEl = document.getElementById('total-carbs');

    // Meal Detail View
    const mealDetailView = document.getElementById('meal-detail-view');

    // ============================================= //
    // ================ API CALLS ================== //
    // ============================================= //
    const API_BASE_URL = 'http://localhost:5000'; // Update this with your .NET API URL

    const identifyFood = async (imageData) => {
        try {
            const formData = new FormData();
            // Convert base64 to blob
            const base64Data = imageData.split(',')[1];
            const blob = await (await fetch(`data:image/jpeg;base64,${base64Data}`)).blob();
            formData.append('image', blob, 'food_image.jpg');

            const response = await fetch(`${API_BASE_URL}/api/food/identify`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.foodName;
        } catch (error) {
            console.error('Error identifying food:', error);
            throw error;
        }
    };

    const getNutrition = async (foodName) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/food/nutrition/${encodeURIComponent(foodName)}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
                name: foodName,
                nutrition: {
                    calories: data.calories,
                    protein: data.protein,
                    fat: data.fat,
                    carbs: data.carbs
                }
            };
        } catch (error) {
            console.error('Error fetching nutrition data:', error);
            throw error;
        }
    };

    // ============================================= //
    // ============= RENDER FUNCTIONS ============== //
    // ============================================= //
    const renderMealList = () => {
        mealList.innerHTML = '';
        if (meals.length === 0) {
            emptyMealListMessage.classList.remove('hidden');
        } else {
            emptyMealListMessage.classList.add('hidden');
            meals.forEach(meal => {
                const li = document.createElement('li');
                li.className = 'meal-list-item';
                li.dataset.id = meal.id;
                if (meal.id === activeMealId) {
                    li.classList.add('active');
                }
                li.innerHTML = `
                    <h4>${meal.name}</h4>
                    <p>Calories: ${meal.totalNutrition.calories.toFixed(0)} kcal</p>
                `;
                li.addEventListener('click', () => handleSelectMeal(meal.id));
                mealList.appendChild(li);
            });
        }
    };
    
    const renderCurrentMealFoods = () => {
        currentMealFoodsList.innerHTML = '';
        currentMeal.foods.forEach((food, index) => {
            const li = document.createElement('li');
            li.className = 'food-item';
            li.innerHTML = `
                <div>
                    <p>${food.name}</p>
                    <span>${food.nutrition.calories.toFixed(0)} kcal</span>
                </div>
                <button class="button danger-button" data-index="${index}">X</button>
            `;
            li.querySelector('button').addEventListener('click', () => removeFoodFromCurrentMeal(index));
            currentMealFoodsList.appendChild(li);
        });
        updateTotalNutrition();
    };
    
    const updateTotalNutrition = () => {
        currentMeal.totalNutrition = currentMeal.foods.reduce((totals, food) => {
            totals.calories += food.nutrition.calories;
            totals.protein += food.nutrition.protein;
            totals.fat += food.nutrition.fat;
            totals.carbs += food.nutrition.carbs;
            return totals;
        }, { calories: 0, protein: 0, fat: 0, carbs: 0 });

        totalCaloriesEl.textContent = currentMeal.totalNutrition.calories.toFixed(0);
        totalProteinEl.textContent = currentMeal.totalNutrition.protein.toFixed(1);
        totalFatEl.textContent = currentMeal.totalNutrition.fat.toFixed(1);
        totalCarbsEl.textContent = currentMeal.totalNutrition.carbs.toFixed(1);
    };

    const renderMealDetailView = (meal) => {
        mealDetailView.innerHTML = `
            <div class="view-header">
                <h3 class="detail-header">${meal.name}</h3>
                <button class="button danger-button" id="delete-meal-btn">Delete Meal</button>
            </div>
            <p class="detail-description">${meal.description || 'No description provided.'}</p>
            <div class="card">
                <h4>Total Meal Nutrition</h4>
                <div id="nutrition-totals">
                    <p><strong>Calories:</strong> ${meal.totalNutrition.calories.toFixed(0)} kcal</p>
                    <p><strong>Protein:</strong> ${meal.totalNutrition.protein.toFixed(1)} g</p>
                    <p><strong>Fat:</strong> ${meal.totalNutrition.fat.toFixed(1)} g</p>
                    <p><strong>Carbs:</strong> ${meal.totalNutrition.carbs.toFixed(1)} g</p>
                </div>
            </div>
            <h4>Individual Foods</h4>
            ${meal.foods.map(food => `
                <div class="card individual-food-card">
                    <strong>${food.name}</strong>
                    <ul>
                        <li>Calories: ${food.nutrition.calories.toFixed(0)} kcal</li>
                        <li>Protein: ${food.nutrition.protein.toFixed(1)} g</li>
                        <li>Fat: ${food.nutrition.fat.toFixed(1)} g</li>
                        <li>Carbs: ${food.nutrition.carbs.toFixed(1)} g</li>
                    </ul>
                </div>
            `).join('')}
        `;
        mealDetailView.querySelector('#delete-meal-btn').addEventListener('click', () => deleteMeal(meal.id));
        showView('detail');
    };

    const showView = (viewName) => {
        mealCreatorView.classList.add('hidden');
        mealDetailView.classList.add('hidden');
        if (viewName === 'creator') {
            mealCreatorView.classList.remove('hidden');
        } else if (viewName === 'detail') {
            mealDetailView.classList.remove('hidden');
        }
    };
    
    // ============================================= //
    // ============= EVENT HANDLERS ================ //
    // ============================================= //
    
    const openModal = (mode = 'create', mealId = null) => {
        isEditMode = mode === 'edit';
        modalTitle.textContent = isEditMode ? 'Edit Meal' : 'Create New Meal';
        
        if (isEditMode && mealId) {
            const meal = meals.find(m => m.id === mealId);
            if (meal) {
                currentMeal = { ...meal };
                mealNameInput.value = meal.name;
                mealDescriptionInput.value = meal.description;
                renderCurrentMealFoods();
            }
        } else {
            resetCurrentMeal();
        }
        
        mealModal.classList.remove('hidden');
    };

    const closeModal = () => {
        mealModal.classList.add('hidden');
        resetCurrentMeal();
    };

    newMealBtn.addEventListener('click', () => {
        openModal('create');
    });
    
    saveMealBtn.addEventListener('click', () => {
        currentMeal.name = mealNameInput.value;
        currentMeal.description = mealDescriptionInput.value;
        
        if (!currentMeal.name) {
            alert('Please enter a meal name!');
            return;
        }

        if (isEditMode) {
            const index = meals.findIndex(m => m.id === currentMeal.id);
            if (index !== -1) {
                meals[index] = { ...currentMeal };
            }
        } else {
            const newMeal = { ...currentMeal, id: Date.now() };
            meals.push(newMeal);
        }

        closeModal();
        renderMealList();
        alert('Meal saved successfully!');
    });

    closeModalBtn.addEventListener('click', closeModal);
    cancelMealBtn.addEventListener('click', closeModal);

    // Close modal when clicking outside
    mealModal.addEventListener('click', (e) => {
        if (e.target === mealModal) {
            closeModal();
        }
    });

    const handleSelectMeal = (mealId) => {
        const meal = meals.find(m => m.id === mealId);
        if (meal) {
            activeMealId = mealId;
            renderMealList();
            renderMealDetailView(meal);
            // Add an edit button to the meal detail view
            const editButton = document.createElement('button');
            editButton.className = 'button primary-button';
            editButton.textContent = 'Edit Meal';
            editButton.addEventListener('click', () => openModal('edit', mealId));
            document.querySelector('#meal-detail-view .view-header').appendChild(editButton);
        }
    };
    
    uploadTriggerBtn.addEventListener('click', () => imageUploadInput.click());

    imageUploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreviewContainer.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    analyzeImageBtn.addEventListener('click', async () => {
        loader.classList.remove('hidden');
        analyzeImageBtn.disabled = true;

        try {
            const identifiedFood = await identifyFood(imagePreview.src);
            const foodData = await getNutrition(identifiedFood);

            if (currentMeal.foods.length < 5) {
                currentMeal.foods.push(foodData);
                renderCurrentMealFoods();
            } else {
                alert('You can only add up to 5 foods to a meal.');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred during food analysis.');
        } finally {
            loader.classList.add('hidden');
            analyzeImageBtn.disabled = false;
            imagePreviewContainer.classList.add('hidden');
            imageUploadInput.value = ''; // Reset file input
        }
    });
    
    const removeFoodFromCurrentMeal = (index) => {
        currentMeal.foods.splice(index, 1);
        renderCurrentMealFoods();
    };
    
    const deleteMeal = (mealId) => {
        if (confirm('Are you sure you want to delete this meal?')) {
            meals = meals.filter(m => m.id !== mealId);
            activeMealId = null;
            renderMealList();
            resetCurrentMeal(); // Go back to a clean creator view
            showView('creator');
        }
    };

    exportBtn.addEventListener('click', () => {
        if (meals.length === 0) {
            alert("There are no meals to export.");
            return;
        }

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Meal Name,Description,Calories,Protein (g),Fat (g),Carbs (g),Foods\n";

        meals.forEach(meal => {
            const foodNames = meal.foods.map(f => f.name).join('; ');
            const row = [
                meal.name,
                meal.description,
                meal.totalNutrition.calories.toFixed(0),
                meal.totalNutrition.protein.toFixed(1),
                meal.totalNutrition.fat.toFixed(1),
                meal.totalNutrition.carbs.toFixed(1),
                `"${foodNames}"`
            ].join(',');
            csvContent += row + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "my_meals.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
    
    // ============================================= //
    // ================ UTILITIES ================== //
    // ============================================= //
    const resetCurrentMeal = () => {
        currentMeal = {
            id: null,
            name: '',
            description: '',
            foods: [],
            totalNutrition: { calories: 0, protein: 0, fat: 0, carbs: 0 }
        };
        mealNameInput.value = '';
        mealDescriptionInput.value = '';
        saveMealBtn.disabled = true;
        renderCurrentMealFoods();
    };

    // Enable save button only when there's a name and at least one food
    [mealNameInput, mealDescriptionInput].forEach(input => {
        input.addEventListener('keyup', () => {
            saveMealBtn.disabled = !(mealNameInput.value.trim() && currentMeal.foods.length > 0);
        });
    });
    // A bit complex logic for disabled state, let's simplify for now
    // Re-evaluating on food add/remove is needed
    // Simple solution: check on input change and when adding/removing food.
    // For now we will just enable it on the fly with the keyup event and another check will be added
    
    const originalRenderCurrentMealFoods = renderCurrentMealFoods;
    renderCurrentMealFoods = () => {
        originalRenderCurrentMealFoods();
        saveMealBtn.disabled = !(mealNameInput.value.trim() && currentMeal.foods.length > 0);
    }
    
    // ============================================= //
    // ============= INITIALIZATION ================ //
    // ============================================= //
    const initializeApp = () => {
        renderMealList();
        renderCurrentMealFoods();
        showView('creator');
    };

    initializeApp();
});
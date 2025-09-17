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
    let compressedImageFile = null;
    let compressedImageFiles = [];

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
    const API_BASE_URL = 'http://localhost:5204';

    const fetchMeals = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/refeicoes`);
            if (!response.ok) throw new Error('Failed to fetch meals.');
            return await response.json();
        } catch (error) {
            console.error("Error fetching meals:", error);
            return []; // Retorna um array vazio em caso de erro
        }
    };

    const createMeal = async (mealData, imageFiles) => {
        const formData = new FormData();

        formData.append('refeicaoJson', JSON.stringify(mealData));

        imageFiles.forEach(file => {
            formData.append('imagens', file, file.name || 'image.jpg');
        });

        const response = await fetch(`${API_BASE_URL}/refeicoes`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create meal: ${errorText}`);
        }
        return await response.json();
    };

    const deleteMealApi = async (mealId) => {
        const response = await fetch(`${API_BASE_URL}/refeicoes/${mealId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete meal.');
    };

    const analyzeImagesApi = async (files) => {
        const formData = new FormData();
        files.forEach(file => {
            // O backend espera o nome 'imagens' para a coleção de arquivos
            formData.append('imagens', file, file.name || 'image.jpg');
        });

        const response = await fetch(`${API_BASE_URL}/refeicoes/analyze`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to analyze images: ${errorText}`);
        }
        return await response.json();
    };

    const renderCurrentMealFoods = () => {
        currentMealFoodsList.innerHTML = '';
        currentMeal.Alimentos.forEach((food, index) => {
            const li = document.createElement('li');
            li.className = 'food-item';
            li.innerHTML = `
            <div>
                {/* ATUALIZADO: Acessa as propriedades diretamente */}
                <p>${food.Nome}</p>
                <span>${food.Calorias.toFixed(0)} kcal</span>
            </div>
            <button class="button danger-button" data-index="${index}">X</button>
        `;
            li.querySelector('button').addEventListener('click', () => removeFoodFromCurrentMeal(index));
            currentMealFoodsList.appendChild(li);
        });
        updateTotalNutrition();
    };

    const updateTotalNutrition = () => {
        const totals = currentMeal.Alimentos.reduce((totals, food) => {
            totals.Calorias += food.Calorias;
            totals.Proteinas += food.Proteinas;
            totals.GordurasTotais += food.GordurasTotais;
            totals.Carboidratos += food.Carboidratos;
            return totals;
        }, { Calorias: 0, Proteinas: 0, GordurasTotais: 0, Carboidratos: 0 });

        currentMeal.totalNutrition = totals;

        totalCaloriesEl.textContent = totals.Calorias.toFixed(0);
        totalProteinEl.textContent = totals.Proteinas.toFixed(1);
        totalFatEl.textContent = totals.GordurasTotais.toFixed(1);
        totalCarbsEl.textContent = totals.Carboidratos.toFixed(1);
    };

    const renderMealDetailView = (meal) => {
        const totalNutrition = meal.Alimentos.reduce((totals, food) => {
            totals.Calorias += food.Calorias;
            totals.Proteinas += food.Proteinas;
            totals.GordurasTotais += food.GordurasTotais;
            totals.Carboidratos += food.Carboidratos;
            return totals;
        }, { Calorias: 0, Proteinas: 0, GordurasTotais: 0, Carboidratos: 0 });

        mealDetailView.innerHTML = `
        <div class="view-header">
            {/* ATUALIZADO: Usa 'Nome' e 'Descricao' */}
            <h3 class="detail-header">${meal.Nome}</h3>
            <button class="button danger-button" id="delete-meal-btn">Delete Meal</button>
        </div>
        <p class="detail-description">${meal.Descricao || 'No description provided.'}</p>
        <div class="card">
            <h4>Total Meal Nutrition</h4>
            <div id="nutrition-totals">
                {/* ATUALIZADO: Acessa os totais calculados */}
                <p><strong>Calories:</strong> ${totalNutrition.Calorias.toFixed(0)} kcal</p>
                <p><strong>Protein:</strong> ${totalNutrition.Proteinas.toFixed(1)} g</p>
                <p><strong>Fat:</strong> ${totalNutrition.GordurasTotais.toFixed(1)} g</p>
                <p><strong>Carbs:</strong> ${totalNutrition.Carboidratos.toFixed(1)} g</p>
            </div>
        </div>
        <h4>Individual Foods</h4>
        {/* ATUALIZADO: Mapeia sobre 'Alimentos' e usa novas propriedades */}
        ${meal.Alimentos.map(food => `
            <div class="card individual-food-card">
                <strong>${food.Nome}</strong>
                <ul>
                    <li>Calories: ${food.Calorias.toFixed(0)} kcal</li>
                    <li>Protein: ${food.Proteinas.toFixed(1)} g</li>
                    <li>Fat: ${food.GordurasTotais.toFixed(1)} g</li>
                    <li>Carbs: ${food.Carboidratos.toFixed(1)} g</li>
                </ul>
            </div>
        `).join('')}
    `;
        mealDetailView.querySelector('#delete-meal-btn').addEventListener('click', () => deleteMeal(meal.Id));
        showView('detail');
    };

    // ============================================= //
    // ============= EVENT HANDLERS ================ //
    // ============================================= //

    const openModal = () => {
        modalTitle.textContent = 'Criar Nova Refeição';
        resetCurrentMeal();
        mealModal.classList.remove('hidden');
    };

    const closeModal = () => {
        mealModal.classList.add('hidden');
        resetCurrentMeal();
    };

    newMealBtn.addEventListener('click', openModal);


    saveMealBtn.addEventListener('click', async () => {
        currentMeal.Nome = mealNameInput.value;
        currentMeal.Descricao = mealDescriptionInput.value;

        if (!currentMeal.Nome) {
            alert('Por favor, dê um nome para a refeição!');
            return;
        }

        try {
            await createMeal(currentMeal, compressedImageFiles);

            closeModal();
            await initializeApp();
            alert('Refeição salva com sucesso!');

        } catch (error) {
            console.error("Falha ao salvar a refeição:", error);
            alert(`Ocorreu um erro ao salvar a refeição: ${error.message}`);
        }
    });

    closeModalBtn.addEventListener('click', closeModal);
    cancelMealBtn.addEventListener('click', closeModal);

    mealModal.addEventListener('click', (e) => {
        if (e.target === mealModal) {
            closeModal();
        }
    });

    const renderMealList = () => {
        mealList.innerHTML = '';
        if (meals.length === 0) {
            emptyMealListMessage.classList.remove('hidden');
            return;
        }
        emptyMealListMessage.classList.add('hidden');

        meals.forEach(meal => {
            const li = document.createElement('li');
            li.className = 'meal-list-item';
            li.dataset.mealId = meal.id;
            if (meal.id === activeMealId) {
                li.classList.add('active');
            }

            let firstImageHtml = '<div class="meal-list-item-image"></div>';
            if (meal.alimentos && meal.alimentos.length > 0 && meal.alimentos[0].caminhoImagem) {
                const imageUrl = `${API_BASE_URL}/${meal.alimentos[0].caminhoImagem}`;
                firstImageHtml = `<img src="${imageUrl}" alt="${meal.nome}" class="meal-list-item-image">`;
            }

            li.innerHTML = `
            ${firstImageHtml}
            <div class="meal-list-item-details">
                <h4>${meal.nome}</h4>
                <p>${meal.descricao || 'Sem descrição'}</p>
            </div>
        `;

            li.addEventListener('click', () => handleSelectMeal(meal.id));
            mealList.appendChild(li);
        });
    };

    const handleSelectMeal = (mealId) => {
        const meal = meals.find(m => m.id === mealId);
        if (meal) {
            activeMealId = mealId;
            renderMealList();
            renderMealDetailView(meal);
        }
    };

    uploadTriggerBtn.addEventListener('click', () => imageUploadInput.click());

    imageUploadInput.addEventListener('change', async (event) => {
        if (!event.target.files || event.target.files.length === 0) return;

        if (event.target.files.length > 5) {
            alert("Você pode enviar no máximo 5 imagens por vez.");
            imageUploadInput.value = ''; // Limpa a seleção
            return;
        }

        loader.classList.remove('hidden');
        imagePreviewContainer.classList.add('hidden');
        const previewGrid = document.getElementById('image-preview-grid');
        previewGrid.innerHTML = ''; // Limpa pré-visualizações antigas
        compressedImageFiles = []; // Limpa a lista de arquivos

        const options = {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 1024,
            useWebWorker: true
        };

        try {
            // Processa todas as imagens selecionadas em paralelo
            const compressionPromises = Array.from(event.target.files).map(file => imageCompression(file, options));
            const compressedFiles = await Promise.all(compressionPromises);

            compressedImageFiles = compressedFiles; // Salva os arquivos comprimidos

            // Cria e exibe a pré-visualização para cada imagem
            compressedFiles.forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    previewGrid.appendChild(img);
                };
                reader.readAsDataURL(file);
            });

            imagePreviewContainer.classList.remove('hidden');

        } catch (error) {
            console.error("Erro ao comprimir as imagens:", error);
            alert("Ocorreu um erro ao processar as imagens.");
        } finally {
            loader.classList.add('hidden');
        }
    });

    analyzeImageBtn.addEventListener('click', async () => {
        if (compressedImageFiles.length === 0) {
            alert("Por favor, carregue uma ou mais imagens para analisar.");
            return;
        }

        loader.classList.remove('hidden');
        analyzeImageBtn.disabled = true;

        try {
            const foodsFromApi = await analyzeImagesApi(compressedImageFiles);

            foodsFromApi.forEach(food => {
                if (currentMeal.Alimentos.length < 5) {
                    currentMeal.Alimentos.push(food);
                }
            });

            renderCurrentMealFoods();

            imagePreviewContainer.classList.add('hidden');
            document.getElementById('image-preview-grid').innerHTML = '';
            imageUploadInput.value = '';
            compressedImageFiles = [];

        } catch (error) {
            console.error(error);
            alert(`Ocorreu um erro durante a análise dos alimentos: ${error.message}`);
        } finally {
            loader.classList.add('hidden');
            analyzeImageBtn.disabled = false;
        }
    });

    const deleteMeal = async (mealId) => {
        if (confirm('Are you sure you want to delete this meal?')) {
            try {
                await deleteMealApi(mealId);
                activeMealId = null;
                await initializeApp();
                showView('creator');
            } catch (error) {
                console.error("Failed to delete meal:", error);
                alert("An error occurred while deleting the meal.");
            }
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
            Id: null,
            Nome: '',
            Descricao: '',
            Alimentos: [],
        };
        mealNameInput.value = '';
        mealDescriptionInput.value = '';
        saveMealBtn.disabled = true;
        renderCurrentMealFoods();
    };

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
    const initializeApp = async () => {
        meals = await fetchMeals();
        renderMealList();
        resetCurrentMeal();
        showView('creator');
    };

    initializeApp();
});
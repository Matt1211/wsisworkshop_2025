document.addEventListener('DOMContentLoaded', () => {

    // ============================================= //
    // =============== STATE MANAGEMENT ============== //
    // ============================================= //
    let meals = [];
    let currentMeal = {
        id: null,

        nome: '',

        descricao: '',
        alimentos: [],

        totaisNutricionais: {
            calorias: 0,
            proteinas: 0,
            gordurasTotais: 0,
            carboidratos: 0
        }
    };
    let compressedImageFile = null;
    let compressedImageFiles = [];
    let activeMealId = null;

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
    const mealCreatorView = document.getElementById('meal-creator-view'); // Note: This ID is not in the HTML, might be a leftover
    const mealNameInput = document.getElementById('meal-name');
    const mealDescriptionInput = document.getElementById('meal-description');
    const uploadTriggerBtn = document.getElementById('upload-trigger-btn');
    const imageUploadInput = document.getElementById('image-upload-input');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    // const imagePreview = document.getElementById('image-preview'); // Note: This ID was removed from HTML
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
            if (!response.ok) throw new Error('Falha ao buscar refeições.');
            return await response.json();
        } catch (error) {
            console.error("Erro ao buscar refeições:", error);
            return [];
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
            throw new Error(`Falha ao criar refeição: ${errorText}`);
        }
        return await response.json();
    };

    const deleteMealApi = async (mealId) => {
        const response = await fetch(`${API_BASE_URL}/refeicoes/${mealId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Falha ao deletar refeição.');
    };

    const analyzeImagesApi = async (files) => {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('imagens', file, file.name || 'image.jpg');
        });
        const response = await fetch(`${API_BASE_URL}/refeicoes/analyze`, {
            method: 'POST',
            body: formData
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Falha ao analisar imagens: ${errorText}`);
        }
        return await response.json();
    };

    const renderCurrentMealFoods = () => {
        currentMealFoodsList.innerHTML = '';
        currentMeal.alimentos.forEach((food, index) => {
            const li = document.createElement('li');
            li.className = 'food-item';
            li.innerHTML = `
            <div class="food-item-info">
                <img src="${food.imagemSrc}" alt="${food.nome}" class="food-item-image">
                <div>
                    <p>${food.nome}</p>
                    <span>${food.calorias.toFixed(0)} kcal</span>
                </div>
            </div>
            <button class="button danger-button" data-index="${index}">X</button>
        `;
            li.querySelector('button').addEventListener('click', () => removeFoodFromCurrentMeal(index));
            currentMealFoodsList.appendChild(li);
        });
        updateTotalNutrition();
        updateSaveButtonState();
    };

    const updateTotalNutrition = () => {
        const totals = currentMeal.alimentos.reduce((totals, food) => {
            totals.calorias += food.calorias;
            totals.proteinas += parseFloat(food.proteinas);
            totals.gordurasTotais += parseFloat(food.gordurasTotais);
            totals.carboidratos += parseFloat(food.carboidratos);
            return totals;
        }, { calorias: 0, proteinas: 0, gordurasTotais: 0, carboidratos: 0 });

        currentMeal.totaisNutricionais = totals;

        totalCaloriesEl.textContent = totals.calorias.toFixed(0);
        totalProteinEl.textContent = totals.proteinas.toFixed(1);
        totalFatEl.textContent = totals.gordurasTotais.toFixed(1);
        totalCarbsEl.textContent = totals.carboidratos.toFixed(1);
    };

    const renderMealDetailView = (meal) => {
        const totalNutrition = meal.alimentos.reduce((totals, food) => {
            totals.calorias += food.calorias;
            totals.proteinas += parseFloat(food.proteinas);
            totals.gordurasTotais += parseFloat(food.gordurasTotais);
            totals.carboidratos += parseFloat(food.carboidratos);
            return totals;
        }, { calorias: 0, proteinas: 0, gordurasTotais: 0, carboidratos: 0 });

        mealDetailView.innerHTML = `
        <div class="view-header">
            <h3 class="detail-header">${meal.nome}</h3>
            <button class="button danger-button" id="delete-meal-btn">Deletar Refeição</button>
        </div>
        <p class="detail-description">${meal.descricao || 'Nenhuma descrição fornecida.'}</p>
        <div class="card">
            <h4>Nutrientes Totais da Refeição</h4>
            <div id="nutrition-totals">
                <p><strong>Calorias:</strong> ${totalNutrition.calorias.toFixed(0)} kcal</p>
                <p><strong>Proteínas:</strong> ${totalNutrition.proteinas.toFixed(1)} g</p>
                <p><strong>Gorduras:</strong> ${totalNutrition.gordurasTotais.toFixed(1)} g</p>
                <p><strong>Carboidratos:</strong> ${totalNutrition.carboidratos.toFixed(1)} g</p>
            </div>        
        </div>
        <h4>Alimentos Individuais</h4>
        ${meal.alimentos.map(food => `
            <div class="card individual-food-card">
                <div class="food-detail-header">
                    <img src="${food.urlImagem}" alt="${food.nome}" class="food-detail-image">
                    <strong>${food.nome}</strong>
                </div>
                <ul>
                    <li>Calorias: ${food.calorias.toFixed(0)} kcal</li>
                    <li>Proteínas: ${food.proteinas.toFixed(1)} g</li>
                    <li>Gorduras: ${food.gordurasTotais.toFixed(1)} g</li>
                    <li>Carboidratos: ${food.carboidratos.toFixed(1)} g</li>
                </ul>
            </div>
        `).join('')}
    `;
        mealDetailView.querySelector('#delete-meal-btn').addEventListener('click', () => deleteMeal(meal.id));
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
        currentMeal.nome = mealNameInput.value;
        currentMeal.descricao = mealDescriptionInput.value;

        if (!currentMeal.nome) {
            alert('Por favor, dê um nome para a refeição!');
            return;
        }

        const mealDataToSend = {
            nome: currentMeal.nome,
            descricao: currentMeal.descricao,
            alimentos: currentMeal.alimentos.map(({ imagemSrc, ...food }) => food)
        };

        try {
            const imageFilesToSend = compressedImageFiles.map(fileObj => fileObj.file);
            await createMeal(mealDataToSend, imageFilesToSend);
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
            if (meal.alimentos && meal.alimentos.length > 0 && meal.alimentos[0].urlImagem) {
                firstImageHtml = `<img src="${meal.alimentos[0].urlImagem}" alt="${meal.nome}" class="meal-list-item-image">`;
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
            imageUploadInput.value = '';
            return;
        }

        loader.classList.remove('hidden');
        imagePreviewContainer.classList.add('hidden');
        const previewGrid = document.getElementById('image-preview-grid');
        previewGrid.innerHTML = '';
        compressedImageFiles = []; // Limpa o array

        const options = {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 1024,
            useWebWorker: true
        };

        try {
            // Mapeia cada arquivo para uma promessa que comprime e lê o arquivo
            const fileProcessingPromises = Array.from(event.target.files).map(file =>
                imageCompression(file, options).then(compressedFile => {
                    return new Promise(resolve => {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            // Resolve com um objeto contendo o arquivo E a URL de dados para exibição
                            resolve({ file: compressedFile, dataURL: e.target.result });
                        };
                        reader.readAsDataURL(compressedFile);
                    });
                })
            );

            const processedFiles = await Promise.all(fileProcessingPromises);
            compressedImageFiles = processedFiles;

            processedFiles.forEach(fileObj => {
                const img = document.createElement('img');
                img.src = fileObj.dataURL;
                previewGrid.appendChild(img);
            });

            imagePreviewContainer.classList.remove('hidden');

        } catch (error) {
            console.error("Erro ao processar as imagens:", error);
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
            const filesToAnalyze = compressedImageFiles.map(fileObj => fileObj.file);
            const foodsFromApi = await analyzeImagesApi(filesToAnalyze);

            foodsFromApi.forEach((food, index) => {
                if (currentMeal.alimentos.length < 5) {
                    const foodWithImage = {
                        ...food,
                        imagemSrc: compressedImageFiles[index].dataURL
                    };
                    currentMeal.alimentos.push(foodWithImage);
                }
            });
            renderCurrentMealFoods();

            imagePreviewContainer.classList.add('hidden');
            document.getElementById('image-preview-grid').innerHTML = '';
            imageUploadInput.value = '';

        } catch (error) {
            console.error(error);
            alert(`Ocorreu um erro durante a análise dos alimentos: ${error.message}`);
        } finally {
            loader.classList.add('hidden');
            analyzeImageBtn.disabled = false;
        }
    });

    const deleteMeal = async (mealId) => {
        if (confirm('Você tem certeza que deseja deletar esta refeição?')) {
            try {
                await deleteMealApi(mealId);
                activeMealId = null;
                await initializeApp();
                showView('creator'); // Note: showView function is not defined, assuming it exists
            } catch (error) {
                console.error("Falha ao deletar a refeição:", error);
                alert("Ocorreu um erro ao deletar a refeição.");
            }
        }
    };

    exportBtn.addEventListener('click', () => {
        if (meals.length === 0) {
            alert("Não há refeições para exportar.");
            return;
        }

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Nome da Refeição,Descrição,calorias,Proteínas (g),Gorduras (g),carboidratos (g),Alimentos\n";

        meals.forEach(meal => {
            const foodNames = meal.alimentos.map(f => f.nome).join('; ');
            const totalNutrition = meal.alimentos.reduce((totals, food) => {
                totals.calorias += food.calorias;
                totals.proteinas += parseFloat(food.proteinas);
                totals.gordurasTotais += parseFloat(food.gordurasTotais);
                totals.carboidratos += parseFloat(food.carboidratos);
                return totals;
            }, { calorias: 0, proteinas: 0, gordurasTotais: 0, carboidratos: 0 });

            const row = [
                `"${meal.nome}"`,
                `"${meal.descricao}"`,
                totalNutrition.calorias.toFixed(0),
                totalNutrition.proteinas.toFixed(1),
                totalNutrition.gordurasTotais.toFixed(1),
                totalNutrition.carboidratos.toFixed(1),
                `"${foodNames}"`
            ].join(',');
            csvContent += row + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "minhas_refeicoes.csv");
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
            nome: '',
            descricao: '',
            alimentos: [],
            totaisNutricionais: {
                calorias: 0,
                proteinas: 0,
                gordurasTotais: 0,
                carboidratos: 0
            }
        };

        mealNameInput.value = '';
        mealDescriptionInput.value = '';
        saveMealBtn.disabled = true;
        renderCurrentMealFoods();
    };

    const showView = (viewName) => {
        // This function is missing in the original code but is called in deleteMeal.
        // Assuming 'creator' is the default view and it's always visible in the right panel.
        // For 'detail', the content is rendered into mealDetailView.
        if (viewName === 'detail') {
            // mealDetailView is already populated by renderMealDetailView
        } else {
            // Logic to show a default/creator view might be needed here.
            // For now, we'll clear the detail view to simulate switching back.
            mealDetailView.innerHTML = '<p>Selecione uma refeição da lista para ver os detalhes, ou crie uma nova.</p>';
        }
    };

    const updateSaveButtonState = () => {
        saveMealBtn.disabled = !(mealNameInput.value.trim() && currentMeal.alimentos.length > 0);
    };

    mealNameInput.addEventListener('keyup', updateSaveButtonState);

    const removeFoodFromCurrentMeal = (index) => {
        currentMeal.alimentos.splice(index, 1);
        renderCurrentMealFoods();
    };

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
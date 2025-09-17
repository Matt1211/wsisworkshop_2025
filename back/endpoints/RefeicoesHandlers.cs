using Microsoft.AspNetCore.Mvc;
using Google.Cloud.Vision.V1;
using MyMinimalApi.models;
using System.Text.Json;

public static class RefeicoesHandlers
{
    private static readonly List<string> termosGenericos = new List<string> // Lista de termos genéricos a serem ignorados para classificação de alimentos
    {
        // Categorias Gerais e Tipos de Prato
        "Food", "Dish", "Cuisine", "Meal", "Recipe", "Gastronomy", "Nourishment", "Edible", "Platter", "Gourmet", "Take-out", "Street food", "Fast food", "biscuit",

        // Componentes de uma Refeição
        "Appetizer", "Main course", "Side dish", "Dessert", "Salad", "Soup", "Snack", "Breakfast", "Lunch", "Dinner", "Brunch",

        // Ingredientes e Grupos Alimentares
        "Ingredient", "Produce", "Fruit", "Vegetable", "Meat", "Poultry", "Seafood", "Fish", "Pasta", "Noodle", "Rice", "Grain", "Legume", "Dairy", "Cheese", "Herb", "Spice", "Nut", "Seed",

        // Panificação e Confeitaria
        "Bakery", "Pastry", "Bread", "Cake", "Cookie", "Pie", "Tart", "Muffin", "Croissant",

        // Bebidas
        "Beverage", "Drink", "Juice", "Smoothie", "Coffee", "Tea", "Cocktail", "Wine",

        // Métodos de Cocção e Apresentação
        "Grilled", "Fried", "Roasted", "Baked", "Steamed", "Sautéed", "Barbecue", "Smoked", "Raw", "Sliced", "Garnish"
    };

    public static async Task<IResult> AnalyzeImagesAsync(
        IFormFileCollection imagens,
        [FromServices] ImageAnnotatorClient visionClient,
        [FromServices] IHttpClientFactory httpClientFactory,
        [FromServices] IConfiguration config)
    {
        if (imagens == null || imagens.Count == 0)
            return Results.BadRequest("Nenhuma imagem foi enviada.");
        if (imagens.Count > 5)
            return Results.BadRequest("É permitido o envio de no máximo 5 imagens por vez.");


        try
        {
            var listaDeAlimentos = new List<Comida>();

            foreach (var imagem in imagens)
            {
                if (imagem.Length == 0) continue;

                var imageFromStream = await Image.FromStreamAsync(imagem.OpenReadStream());
                var labels = await visionClient.DetectLabelsAsync(imageFromStream);

                var melhorPalpite = labels.Where(l => !termosGenericos.Contains(l.Description, StringComparer.OrdinalIgnoreCase))
                                            .OrderByDescending(l => l.Score).FirstOrDefault() ?? labels.OrderByDescending(l => l.Score).FirstOrDefault();

                if (melhorPalpite is null) continue;

                var termoDeBusca = melhorPalpite.Description;
                if (termoDeBusca.Contains("burger", StringComparison.OrdinalIgnoreCase))
                    termoDeBusca = "Hamburger";

                var apiKey = config["UsdaApiKey"];
                var httpClient = httpClientFactory.CreateClient();
                var requestUri = $"https://api.nal.usda.gov/fdc/v1/foods/search?query={Uri.EscapeDataString(termoDeBusca)}&pageSize=1&pageNumber=1&dataType=SR%20Legacy&api_key={apiKey}";
                var response = await httpClient.GetAsync(requestUri);

                if (!response.IsSuccessStatusCode) continue;

                var usdaResult = await response.Content.ReadFromJsonAsync<UsdaSearchResult>();
                var foodData = usdaResult?.foods?.FirstOrDefault();

                if (foodData == null) continue;

                var novaComida = MapearUsdaParaComida(foodData, termoDeBusca);
                listaDeAlimentos.Add(novaComida);
            }

            if (listaDeAlimentos.Count == 0)
            {
                return Results.NotFound("Não foi possível identificar nenhum alimento a partir das imagens enviadas.");
            }

            return Results.Ok(listaDeAlimentos);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Ocorreu um erro na análise: {ex.Message}");
            return Results.Problem($"Ocorreu um erro interno ao processar a análise: {ex.Message}");
        }
    }

    public static async Task<IResult> CreateRefeicaoAsync(
        [FromForm] string refeicaoJson,
        IFormFileCollection imagens,
        [FromServices] DadosRefeicaoService refeicaoService)
    {
        if (string.IsNullOrEmpty(refeicaoJson) || imagens == null || imagens.Count == 0)
            return Results.BadRequest("Dados da refeição ou imagens estão faltando.");

        var refeicaoParaSalvar = JsonSerializer.Deserialize<Refeicao>(refeicaoJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        if (refeicaoParaSalvar == null)
            return Results.BadRequest("O formato dos dados da refeição é inválido.");

        try
        {
            var nomePasta = "imagens_salvas";
            var caminhoProjeto = Directory.GetCurrentDirectory();
            var pastaParaSalvar = Path.Combine(caminhoProjeto, nomePasta);
            if (!Directory.Exists(pastaParaSalvar))
            {
                Directory.CreateDirectory(pastaParaSalvar);
            }

            for (int i = 0; i < imagens.Count; i++)
            {
                var imagem = imagens[i];
                var nomeArquivoUnico = $"{Guid.NewGuid()}{Path.GetExtension(imagem.FileName)}";
                var caminhoCompletoArquivo = Path.Combine(pastaParaSalvar, nomeArquivoUnico);

                using (var fileStream = new FileStream(caminhoCompletoArquivo, FileMode.Create))
                {
                    await imagem.CopyToAsync(fileStream);
                }

                if (i < refeicaoParaSalvar.Alimentos.Count)
                {
                    refeicaoParaSalvar.Alimentos[i].CaminhoImagem = Path.Combine(nomePasta, nomeArquivoUnico).Replace("\\", "/");
                }
            }

            refeicaoParaSalvar.Id = GerarIdUnico();
            refeicaoParaSalvar.DataDeCriacao = DateTime.UtcNow;

            refeicaoService.AdicionarRefeicao(refeicaoParaSalvar);
            Console.WriteLine("Nova refeição salva com sucesso em refeicoes.json.");

            return Results.Created($"/refeicoes/{refeicaoParaSalvar.Id}", refeicaoParaSalvar);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Ocorreu um erro ao salvar a refeição: {ex.Message}");
            return Results.Problem($"Ocorreu um erro interno: {ex.Message}");
        }
    }

    private static Comida MapearUsdaParaComida(UsdaFood foodData, string termoOriginal)
    {
        decimal ObterValorNutriente(string nome, string unidade) =>
            foodData.foodNutrients?
                .FirstOrDefault(n => n.nutrientName
                                .Contains(nome, StringComparison.OrdinalIgnoreCase) && n.unitName.Equals(unidade, StringComparison.OrdinalIgnoreCase))?
                .value ?? 0;

        return new Comida
        {
            Id = foodData.fdcId,
            Nome = foodData.Description ?? termoOriginal,
            Descricao = $"Dados nutricionais para '{foodData.Description}'",
            Calorias = (int)ObterValorNutriente("Energy", "KCAL"),
            Proteinas = ObterValorNutriente("Protein", "G"),
            GordurasTotais = ObterValorNutriente("Total lipid (fat)", "G"),
            Carboidratos = ObterValorNutriente("Carbohydrate, by difference", "G"),
            Fibras = ObterValorNutriente("Fiber, total dietary", "G"),
            Acucares = ObterValorNutriente("Total Sugars", "G"),
            Sodio = ObterValorNutriente("Sodium", "MG"),
            Porcao = 100
        };
    }

    private static int GerarIdUnico() => (int)DateTime.UtcNow.Subtract(new DateTime(1970, 1, 1)).TotalSeconds;

}
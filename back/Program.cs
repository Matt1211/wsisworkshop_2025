using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using Google.Cloud.Vision.V1;
using MyMinimalApi.models;
using System.Linq;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<DadosRefeicaoService>();

builder.Services.AddSingleton<ImageAnnotatorClient>(sp => ImageAnnotatorClient.Create());

builder.Services.AddHttpClient();

builder.Services.AddAntiforgery();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAntiforgery();


var group = app.MapGroup("/refeicoes");

group.MapGet("/", (DadosRefeicaoService service) =>
{
    return Results.Ok(service.RetornarTodasAsRefeicoes());
});

group.MapPost("/upload", async (
    IFormFile imagem,
    [FromServices] ImageAnnotatorClient visionClient,
    [FromServices] IHttpClientFactory httpClientFactory,
    [FromServices] DadosRefeicaoService refeicaoService,
    [FromServices] IConfiguration config) =>
{
    if (imagem == null || imagem.Length == 0)
    {
        return Results.BadRequest("Nenhuma imagem foi enviada.");
    }

    try
    {
        Console.WriteLine("Analisando imagem...");
        var imageFromStream = await Image.FromStreamAsync(imagem.OpenReadStream());
        var labels = await visionClient.DetectLabelsAsync(imageFromStream);

var termosGenericos = new List<string>
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
        var melhorPalpite = labels.Where(l => !termosGenericos.Contains(l.Description, StringComparer.OrdinalIgnoreCase))
                                    .OrderByDescending(l => l.Score).FirstOrDefault();

        if (melhorPalpite == null)
        {
            melhorPalpite = labels.OrderByDescending(l => l.Score).FirstOrDefault();
        }

        if (melhorPalpite is null)
            return Results.NotFound("Não foi possível classificar a imagem.");

        var termoDeBusca = melhorPalpite.Description;

        if (termoDeBusca.Contains("burger", StringComparison.OrdinalIgnoreCase))
            termoDeBusca = "Hamburger";

        Console.WriteLine($"Google Vision identificou a imagem como: '{termoDeBusca}'.");

        Console.WriteLine($"Buscando na API da USDA por: '{termoDeBusca}'...");
        var apiKey = config["UsdaApiKey"];
        var httpClient = httpClientFactory.CreateClient();
        var requestUri = $"https://api.nal.usda.gov/fdc/v1/foods/search?query={Uri.EscapeDataString(termoDeBusca)}&pageSize=1&api_key={apiKey}";
        
        var response = await httpClient.GetAsync(requestUri);
        response.EnsureSuccessStatusCode();

        var usdaResult = await response.Content.ReadFromJsonAsync<UsdaSearchResult>();
        var foodData = usdaResult?.foods?.FirstOrDefault();

        if (foodData == null)
        {
            return Results.NotFound($"Nenhum dado nutricional encontrado para '{termoDeBusca}' na API da USDA.");
        }
        
        Console.WriteLine($"Dados encontrados para '{foodData.description}'. Mapeando para o modelo local...");

        var novaComida = MapearUsdaParaComida(foodData, termoDeBusca);

        var novaRefeicao = new Refeicao
        {
            Id = GerarIdUnico(),
            Nome = $"Refeição com {novaComida.Nome}",
            Descricao = $"Refeição criada a partir de uma imagem de {termoDeBusca}",
            Alimentos = new List<Comida> { novaComida },
            DataDeCriacao = DateTime.UtcNow
        };

        refeicaoService.AdicionarRefeicao(novaRefeicao);
        Console.WriteLine("Nova refeição salva com sucesso em refeicoes.json.");

        return Results.Created($"/refeicoes/{novaRefeicao.Id}", novaRefeicao);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Ocorreu um erro: {ex.Message}");
        return Results.Problem($"Ocorreu um erro interno ao processar a requisição: {ex.Message}");
    }
}).DisableAntiforgery();

app.Run();

Comida MapearUsdaParaComida(UsdaFood foodData, string termoOriginal)
{
    float ObterValorNutriente(string nome, string unidade) =>
        foodData.foodNutrients?
            .FirstOrDefault(n => n.nutrientName.Contains(nome, StringComparison.OrdinalIgnoreCase) && n.unitName.Equals(unidade, StringComparison.OrdinalIgnoreCase))?
            .value ?? 0;

    return new Comida
    {
        Id = foodData.fdcId,
        Nome = foodData.description ?? termoOriginal,
        Descricao = $"Dados nutricionais para '{foodData.description}'",
        Calorias = (int)ObterValorNutriente("Energy", "KCAL"),
        Proteinas = ObterValorNutriente("Protein", "G"),
        GordurasTotais = ObterValorNutriente("Total lipid (fat)", "G"),
        Carboidratos = ObterValorNutriente("Carbohydrate, by difference", "G"),
        Fibras = ObterValorNutriente("Fiber, total dietary", "G"),
        Acucares = ObterValorNutriente("Sugars, total including", "G"),
        Sodio = ObterValorNutriente("Sodium", "MG"),
        Porcao = 100
    };
}

int GerarIdUnico() => (int)DateTime.UtcNow.Subtract(new DateTime(1970, 1, 1)).TotalSeconds;

public record UsdaSearchResult(List<UsdaFood> foods);
public record UsdaFood(int fdcId, string description, List<FoodNutrient> foodNutrients);
public record FoodNutrient(string nutrientName, string unitName, float value);
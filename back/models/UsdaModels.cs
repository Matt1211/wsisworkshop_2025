public record UsdaSearchResult(List<UsdaFood> foods);
public record UsdaFood(int fdcId, string Description, List<FoodNutrient> foodNutrients);
public record FoodNutrient(string nutrientName, string unitName, decimal value);
public static class RefeicoesEndpoints
{
    public static void MapRefeicoesApi(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/refeicoes");

        group.MapGet("/", (DadosRefeicaoService service) =>
        {
            return Results.Ok(service.RetornarTodasAsRefeicoes());
        });

        group.MapDelete("/{id}", (int id, DadosRefeicaoService service) =>
        {
            if (service.DeletarRefeicao(id))
            {
                return Results.NoContent();
            }
            return Results.NotFound();
        });

        group.MapPost("/analyze", RefeicoesHandlers.AnalyzeImagesAsync)
             .DisableAntiforgery();
        
        group.MapPost("/", RefeicoesHandlers.CreateRefeicaoAsync)
             .DisableAntiforgery();
    }
}
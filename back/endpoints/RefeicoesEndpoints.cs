using Microsoft.AspNetCore.Mvc;

public static class RefeicoesEndpoints
{
    public static void MapRefeicoesApi(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/refeicoes");

        group.MapGet("/", (HttpContext httpContext, DadosRefeicaoService service) =>
        {
            var refeicoes = service.RetornarTodasAsRefeicoes();
            var refeicoesDto = refeicoes.Select(r => RefeicoesHandlers.MapearParaDto(r, httpContext));
            return Results.Ok(refeicoesDto);
        });

        group.MapDelete("/{id}", (int id, DadosRefeicaoService service) =>
        {
            if (service.DeletarRefeicao(id))
            {
                return Results.NoContent();
            }
            return Results.NotFound();
        });
    }
}
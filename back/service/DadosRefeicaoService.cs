using System.Text.Json;
using System.Collections.Concurrent;
using MyMinimalApi.models;

public class DadosRefeicaoService
{
    private const string FilePath = "refeicoes.json";
    private readonly ConcurrentDictionary<int, Refeicao> _refeicoes;
    private static readonly object _fileLock = new();

    public DadosRefeicaoService()
    {
        _refeicoes = CarregarRefeicoesDoArquivo();
    }

    private ConcurrentDictionary<int, Refeicao> CarregarRefeicoesDoArquivo()
    {
        try
        {
            var json = File.ReadAllText(FilePath);
            var refeicoes = JsonSerializer.Deserialize<List<Refeicao>>(json) ?? new List<Refeicao>();
            return new ConcurrentDictionary<int, Refeicao>(refeicoes.ToDictionary(r => r.Id));
        }
        catch (JsonException ex)
        {
            Console.WriteLine($"[AVISO] O arquivo 'refeicoes.json' está corrompido e não pôde ser lido. A aplicação iniciará com uma lista vazia. Erro: {ex.Message}");
            return new ConcurrentDictionary<int, Refeicao>();
        }
    }

    private void SalvarMudancas()
    {
        lock (_fileLock)
        {
            var allMeals = _refeicoes.Values.ToList();
            var json = JsonSerializer.Serialize(allMeals, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(FilePath, json);
        }
    }

    public IEnumerable<Refeicao> RetornarTodasAsRefeicoes() =>
                    _refeicoes.Values.OrderByDescending(m => m.DataDeCriacao);

    public Refeicao AdicionarRefeicao(Refeicao meal)
    {
        _refeicoes[meal.Id] = meal;
        SalvarMudancas();
        return meal;
    }

    public bool AtualizarRefeicao(int id, Refeicao updatedMeal)
    {
        if (!_refeicoes.ContainsKey(id))
        {
            return false;
        }

        _refeicoes[id] = updatedMeal;
        SalvarMudancas();
        return true;
    }

    public bool DeletarRefeicao(int id)
    {
        var result = _refeicoes.TryRemove(id, out _);
        if (result)
        {
            SalvarMudancas();
        }
        return result;
    }
}
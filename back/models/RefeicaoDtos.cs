namespace MyMinimalApi.models
{
    // DTO para a Comida, com a URL da imagem
    public class ComidaDto
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Descricao { get; set; } = string.Empty;
        public string UrlImagem { get; set; } = string.Empty;
        public int Calorias { get; set; }
        public decimal Proteinas { get; set; }
        public decimal GordurasTotais { get; set; }
        public decimal Carboidratos { get; set; }
        public decimal Fibras { get; set; }
        public decimal Acucares { get; set; }
        public decimal Sodio { get; set; }
        public decimal Porcao { get; set; }
    }

    public class RefeicaoDto
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Descricao { get; set; } = string.Empty;
        public List<ComidaDto> Alimentos { get; set; } = new List<ComidaDto>();
        public DateTime DataDeCriacao { get; set; }
    }
}
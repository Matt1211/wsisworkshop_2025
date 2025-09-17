namespace MyMinimalApi.models
{
    public class Comida
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Descricao { get; set; } = string.Empty;
        public string CaminhoImagem { get; set; } = string.Empty;
        public int Calorias { get; set; } = 0; // kcal
        public decimal Proteinas { get; set; } = 0; // g
        public decimal GordurasTotais { get; set; } = 0; // g
        public decimal Carboidratos { get; set; } = 0; // g
        public decimal Fibras { get; set; } = 0; // g
        public decimal Acucares { get; set; } = 0; // g
        public decimal Sodio { get; set; } = 0; // mg
        public decimal Porcao { get; set; } = 0; // g
    }
}
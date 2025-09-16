namespace MyMinimalApi.models
{
    public class Comida
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Descricao { get; set; } = string.Empty;
        public string ImagemUrl { get; set; } = string.Empty;
        public int Calorias { get; set; } = 0; // kcal
        public float Proteina { get; set; } = 0; // g
        public float Proteinas { get; set; } = 0; // g
        public float GordurasTotais { get; set; } = 0; // g
        public float Carboidratos { get; set; } = 0; // g
        public float Fibras { get; set; } = 0; // g
        public float Acucares { get; set; } = 0; // g
        public float Sodio { get; set; } = 0; // mg
        public float Porcao { get; set; } = 0; // g
    }
}
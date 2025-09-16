using System;
using System.Collections.Generic;

namespace MyMinimalApi.models
{
    public class Refeicao
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Descricao { get; set; } = string.Empty;
        public List<Comida> Alimentos { get; set; } = new List<Comida>();
        public DateTime DataDeCriacao { get; set; } = DateTime.UtcNow;
    }
}
using Microsoft.AspNetCore.Mvc;
using Google.Cloud.Vision.V1;
using MyMinimalApi.models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<DadosRefeicaoService>();
builder.Services.AddSingleton<ImageAnnotatorClient>(sp => ImageAnnotatorClient.Create());
builder.Services.AddHttpClient();
builder.Services.AddAntiforgery();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

//CORS
var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
    policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://127.0.0.1:5500")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(MyAllowSpecificOrigins);

app.UseAntiforgery();
app.MapRefeicoesApi();

app.Run();
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["VoP.sln", "./"]
COPY ["VoP.Api/VoP.Api.csproj", "VoP.Api/"]
COPY ["VoP.Service/VoP.Service.csproj", "VoP.Service/"]
COPY ["VoP.Repository/VoP.Repository.csproj", "VoP.Repository/"]
COPY ["VoP.DatabaseChecks/VoP.DatabaseChecks.csproj", "VoP.DatabaseChecks/"]
COPY ["VoP.ApiChecks/VoP.ApiChecks.csproj", "VoP.ApiChecks/"]
RUN dotnet restore "VoP.sln"

COPY . .
WORKDIR "/src/VoP.Api"
RUN dotnet publish "VoP.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 5080
ENV ASPNETCORE_URLS=http://+:5080
ENV ASPNETCORE_ENVIRONMENT=Production
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "VoP.Api.dll"]

# Multistage Dockerfile for CampusEats.Api (Root Context)
# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["CampusEats.Api/CampusEats.Api.csproj", "CampusEats.Api/"]
RUN dotnet restore "CampusEats.Api/CampusEats.Api.csproj"

# Copy source code and build/publish Release output
COPY CampusEats.Api/ CampusEats.Api/
WORKDIR "/src/CampusEats.Api"
RUN dotnet publish "CampusEats.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "CampusEats.Api.dll"]

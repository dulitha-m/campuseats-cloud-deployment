# Multistage Dockerfile for CampusEats.Api (Context: CampusEats.Api subdirectory)
# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project file and restore dependencies
COPY ["CampusEats.Api.csproj", "./"]
RUN dotnet restore "CampusEats.Api.csproj"

# Copy remaining source code and publish
COPY . .
RUN dotnet publish "CampusEats.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "CampusEats.Api.dll"]

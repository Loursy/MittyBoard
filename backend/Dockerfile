# --- Build stage -----------------------------------------------------------
FROM eclipse-temurin:25-jdk-jammy AS build
WORKDIR /app

# Cache dependencies separately from source so code-only changes skip the
# (slow) dependency resolution layer.
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -B dependency:go-offline

COPY src ./src
RUN ./mvnw -B -o package -DskipTests

# --- Runtime stage -----------------------------------------------------------
FROM eclipse-temurin:25-jre-jammy
WORKDIR /app

RUN groupadd --system spring && useradd --system --gid spring spring
USER spring:spring

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

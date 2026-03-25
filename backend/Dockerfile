FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY . .

RUN mvn clean package -DskipTests

CMD ["java", "-jar", "target/unmute-backend-1.0.0.jar"]
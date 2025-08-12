FROM openjdk:21-jdk-slim
WORKDIR /app
COPY target/Events-Management-System-*.jar ./ems-backend.jar
EXPOSE 8080
CMD ["java", "-Xmx512m", "-jar", "ems-backend.jar"]
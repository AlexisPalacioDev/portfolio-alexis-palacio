# Proyectos personales

## PoisonFlix
Plataforma de streaming autoalojada. Incluye un cliente web PWA hecho con React y TypeScript, una app para Android TV con Kotlin y Jetpack Compose, y un puente de transmisión compatible con Google Cast, DIAL, DLNA y webOS. Tiene más de 180 archivos de pruebas y CI en GitHub Actions.

## Sprite Studio
Generador de hojas de sprites con IA hecho con React, PixiJS y Vercel Functions. Planifica y genera animaciones usando las APIs de Google Gemini y OpenAI. Tiene 17 suites de pruebas con Vitest.

## Extraction Survivors
Juego multijugador 2D en el navegador para hasta 4 jugadores. Usa un motor ECS propio con paso de tiempo fijo, renderizado con PixiJS/WebGL y red P2P con WebRTC. Código: github.com/AlexisPalacioDev/extraction-survivors.

## HY300 PoisonOS
Launcher Android y kit de personalización sin root para el proyector HY300, construido en Kotlin y desplegado vía ADB. Código: github.com/AlexisPalacioDev/hy300-poisonos.

## Este asistente (Pregúntale a mi perfil)
Este chat es un asistente de preguntas y respuestas con RAG (generación aumentada por recuperación) construido por Alexis para su portafolio. Divide su perfil en fragmentos, genera embeddings de cada fragmento, recupera los más parecidos a la pregunta por similitud coseno y le pide al modelo de lenguaje responder solo con esa información, citando las fuentes. Tiene un conjunto de evaluación que mide si la recuperación encuentra el fragmento correcto.

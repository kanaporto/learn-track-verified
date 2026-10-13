# Dumpi Learn — construcción por etapas

## Identidad confirmada
- El producto se llama **Dumpi Learn** y el robot **DUMPI**, nunca DAMPY.
- La imagen aportada, generada con IA por el propietario, se utilizará **solo como referencia para la aplicación**. No se modificará el cartel ni se incrustará como pantalla.
- Conservar el aspecto del mismo robot: cuerpo metálico claro, rostro de pantalla oscura, ojos azules expresivos, extremidades articuladas y mochila. Glitch mantiene la capucha, el portátil y el aspecto de hacker-virus.
- El tono de Glitch seguirá el PRD: travieso, nunca intimidatorio ni dirigido contra el alumno. No trasladar a la aplicación las frases del cartel que contradigan ese tono.
- La disponibilidad de la marca continúa **pendiente**. El origen IA de la referencia no acredita por sí solo derechos comerciales sobre los recursos finales.

## Etapa 1 — interfaz para revisar
Esta será la primera entrega; no se presentará todavía como un MVP funcional completo.

- Crear la experiencia de **Mi aventura** en la página inicial, sin página publicitaria, con navegación a Certificaciones, Clasificaciones y Perfil; incluir acceso a estadísticas personales.
- Diseñar las pantallas de acceso, catálogo, mapa, práctica, falta de vidas, repaso, inicio de simulacro, examen, resultados y revisión.
- Aplicar la paleta aprobada del PRD, lectura cómoda en móvil, tablet y escritorio, controles accesibles y ajustes de sonido y movimiento.
- Preparar la interfaz en español e inglés. No traducir preguntas en directo.
- Mantener certificaciones, regiones y simulacros pendientes hasta contar con información oficial verificada y preguntas aportadas. Sin preguntas inventadas, dominios ficticios, clasificaciones falsas ni progreso simulado como real.
- Preparar la integración visual de DUMPI y Glitch a partir de la referencia. La imagen no equivale a los personajes separados ni a los bailes terminados: revisar los recursos adaptados antes de tratarlos como definitivos.
- No elegir una tipografía sustituta ni música definitiva sin autorización; TT Hoves y su licencia siguen pendientes. Mientras tanto, la estructura de revisión podrá usar la fuente del sistema sin afirmar que es la identidad final.
- Mostrar estados de carga, contenido pendiente, error de conexión y controles aún no disponibles de forma honesta.

## Etapa 2 — cuentas y datos
- Activar Lovable Cloud antes de implementar cuentas, almacenamiento o funciones de servidor.
- Añadir registro por correo y contraseña, verificación, recuperación, sesión y eliminación de cuenta y datos.
- Conectar Resend para los correos cuando estén disponibles su configuración y un remitente autorizado; comprobar entrega real antes de declarar la integración completa.
- Guardar perfiles, preferencias, catálogo verificado, preguntas bilingües preaprobadas, progreso, vidas, intentos y registro de puntos.
- Administración directa en el backend, sin panel administrativo ni revisión editorial dentro de la aplicación.

## Etapa 3 — aprendizaje y reglas
- Práctica: banco de 50 preguntas por región, selección aleatoria, diez aciertos no consecutivos para completar, un avance por acierto, sin retroceso al fallar y explicación únicamente tras fallo.
- Vidas: máximo diez, un fallo consume una, recuperación de una por hora y recuperación completa identificada como función de pruebas del hackatón. Cero vidas bloquea responder en práctica, no repasar.
- Repaso: sin vidas, puntos ni cambios en la aventura.
- Puntuar nuevamente las repeticiones, sin límites ni penalizaciones. Activar la distribución de niveles solo tras aprobar la fórmula.
- Clasificaciones global y por certificación: acumulativas, alias públicos y empates con la misma posición.
- Simulacros ilimitados desde el inicio, independientes de las vidas y sin ayudas, Glitch ni puntos por respuesta. Habilitarlos únicamente con configuración suficiente y verificada.
- Recompensas por intento aprobado: 500 puntos, o 650 si además alcanza al menos 95 % de aciertos; una sola concesión por intento.
- Completar la aventura exige todas las regiones y aprobar después el reto final.
- Aplicar las intervenciones de Glitch, estadísticas diferenciadas y celebraciones conforme al PRD, cuando sus recursos estén aprobados.

## Etapa 4 — instalación e integraciones finales
- Añadir instalación en la pantalla de inicio mediante manifiesto e iconos, **sin modo offline ni caché de práctica**.
- Proponer y aprobar el mecanismo de push antes de implementarlo. Los recordatorios serán opcionales a las 18:00 de la zona horaria del usuario, solo los días sin práctica, con permisos y disponibilidad reales.
- Integrar personajes, cuatro bailes regionales, quinto baile de aprobación y música cuando sus archivos y condiciones de uso estén resueltos.

## Pendientes que no se resolverán por suposición
- Banco de preguntas y traducciones; nombre de Python; nombres, versiones, dominios y formatos oficiales de las certificaciones.
- Fórmula de distribución de niveles: propuesta todavía no aprobada `nivel = 1 + redondear(4 × (i−1)/(N−1))`, con nivel 1 cuando N=1. Ejemplos: tres dominios → 10/30/50 puntos; seis → 10/20/30/30/40/50. No implementarla hasta confirmación.
- Recursos finales y derechos de personajes, animaciones, música y TT Hoves; proveedor de push; textos legales y privacidad; disponibilidad de marca.
- Nombre del proyecto en el editor: el propietario puede cambiarlo desde el nombre superior izquierdo → Rename → Dumpi Learn; no afirmar que ese cambio se ha realizado sin comprobarlo.

## Detalles técnicos y comprobaciones
- Mantener React, TypeScript, Vite, Tailwind v4 y shadcn/ui sobre el entorno nativo TanStack Start; no usar Next.js.
- Pantallas separadas con navegación propia y títulos y descripciones específicos. Recursos de personajes separados del cartel de referencia.
- Validación de entradas con esquemas compartidos en cliente y servidor; restricciones de acceso a datos privados. Nunca exponer secretos ni enviar respuestas correctas antes del momento permitido.
- Resolver avances, consumo de vidas y recompensas mediante operaciones de servidor atómicas e idempotentes; el cliente no decide el estado autorizado.
- Pruebas concretas para cada regla de aciertos, vidas, repaso, recompensas, reto final, empates y recordatorios. Comprobar los recorridos con una cuenta real y verificar persistencia entre sesiones cuando se conecte Cloud.
- Revisar navegación, legibilidad y recursos en móvil y escritorio. Instalación y push requieren además comprobación en dispositivos y navegadores objetivo.
- Mantener fuera del alcance pagos, publicidad, códigos, administración en la PWA, práctica offline, tiendas móviles y cualquier función excluida en el PRD.

**La aprobación permite empezar por la etapa 1; no aprueba automáticamente la fórmula de puntos, recursos finales ni otras decisiones pendientes.**
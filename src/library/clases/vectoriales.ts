import { type Clase, code } from "../types";

export const claseVectoriales: Clase = {
  titulo: "Bases de datos vectoriales: buscar por significado, no por palabras",
  bajada:
    "Qué es un embedding, cómo se busca entre millones de vectores sin recorrerlos todos, cómo se arma una búsqueda semántica o un RAG, " +
    "los errores que arruinan los resultados y cuándo conviene una base dedicada o pgvector.",
  secciones: [
    {
      heading: "Qué es y qué problema resuelve",
      parrafos: [
        "Una base de datos vectorial guarda vectores (listas de números) y permite encontrar los más parecidos a uno dado. Esos vectores se llaman embeddings, y los produce un modelo de inteligencia artificial: convierte un texto, una imagen o un audio en una lista de cientos o miles de números, de modo que contenidos con significado parecido quedan cerca entre sí en ese espacio. \"Perro\" y \"mascota\" quedan cerca; \"perro\" e \"impuestos\", lejos.",
        "El problema que resuelve es el de la búsqueda por significado. Una búsqueda normal encuentra las palabras exactas que escribiste; si el documento dice \"automóvil\" y buscás \"coche\", no lo encuentra. Con embeddings, la consulta y los documentos se comparan por significado. Es la base de la búsqueda semántica, de las recomendaciones y de RAG (generación aumentada por recuperación), la técnica con la que un modelo de lenguaje responde usando tus propios documentos.",
      ],
    },
    {
      heading: "Historia corta",
      parrafos: [
        "La idea de representar palabras como vectores existe hace décadas, pero se volvió práctica en 2013 con word2vec, de Google, que mostró que las operaciones con vectores capturaban relaciones de significado. Con los transformers (2017) y los modelos de lenguaje, los embeddings se volvieron mucho mejores y pasaron a representar oraciones y documentos enteros.",
        "Con los años aparecieron bases pensadas para guardarlos y buscarlos: Milvus, Pinecone, Weaviate y Qdrant, entre otras. Y las bases tradicionales se sumaron: pgvector, una extensión de PostgreSQL (2021), permite guardar vectores junto a los datos de siempre. Hoy MongoDB, Redis y Elasticsearch también ofrecen búsqueda vectorial.",
      ],
    },
    {
      heading: "Cómo funciona por dentro",
      parrafos: [
        "Comparar la consulta contra todos los vectores guardados da el resultado exacto, pero es lento con millones: hay que calcular una distancia por cada uno. Por eso se usan índices de búsqueda aproximada (ANN): encuentran casi los mismos vecinos mirando una fracción pequeña de los datos. Se pierde un poco de exactitud a cambio de una velocidad enorme.",
        "Los dos índices más comunes son HNSW e IVF. HNSW construye un grafo en capas en el que cada vector está conectado con sus vecinos; la búsqueda entra por la capa de arriba (pocos nodos, saltos largos) y baja afinando. IVF agrupa los vectores en zonas (con k-means) y, al consultar, busca solo en las zonas más cercanas. HNSW suele dar mejor equilibrio entre velocidad y exactitud a costa de más memoria; IVF ocupa menos y se construye más rápido. La medida de calidad se llama recall: qué porcentaje de los vecinos verdaderos devuelve el índice.",
        "La distancia que se use también importa: coseno (compara la dirección, ignora el largo; la más común con texto), euclidiana o producto interno. Tiene que coincidir con la que recomienda el modelo y con la del índice.",
      ],
    },
    {
      heading: "Tu primera búsqueda por similitud",
      parrafos: [
        "Con PostgreSQL y pgvector, en tres dimensiones para poder leerlo (los modelos reales usan cientos o miles):",
      ],
      codigo: [
        code`
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE documentos (
  id        bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  contenido text NOT NULL,
  embedding vector(3)
);

INSERT INTO documentos (contenido, embedding) VALUES
  ('gatos y perros', '[0.9, 0.1, 0.0]'),
  ('mascotas del hogar', '[0.8, 0.2, 0.1]'),
  ('impuestos y facturas', '[0.0, 0.1, 0.9]');

SELECT contenido
FROM documentos
ORDER BY embedding <=> '[0.85, 0.15, 0.05]'   -- distancia coseno
LIMIT 2;                                       -- las dos de mascotas`,
      ],
    },
    {
      heading: "De documentos a respuestas: el camino de un RAG",
      parrafos: [
        "En una aplicación real, los vectores no los escribís a mano: los calcula un modelo. El flujo de RAG tiene dos fases. Para indexar: cortás cada documento en fragmentos (de unos cientos de palabras, con algo de solapamiento para no cortar ideas por la mitad), calculás el embedding de cada uno y lo guardás junto al texto. Para responder: calculás el embedding de la pregunta, recuperás los fragmentos más parecidos, y se los pasás al modelo de lenguaje como contexto para que responda basándose en ellos.",
        "La calidad depende más de cómo cortás y de qué recuperás que del modelo que escribe la respuesta. Si el fragmento correcto no llega al contexto, el modelo no tiene de dónde sacar la respuesta.",
      ],
      codigo: [
        {
          lang: "python",
          text: code`
def indexar(documento: str):
    for i, texto in enumerate(cortar(documento, palabras=300, solape=50)):
        vector = modelo_embeddings(texto)          # lista de números
        guardar(texto=texto, posicion=i, embedding=vector)

def responder(pregunta: str) -> str:
    vector = modelo_embeddings(pregunta)           # el MISMO modelo
    fragmentos = buscar_similares(vector, limite=5)
    contexto = "\n\n".join(f.texto for f in fragmentos)
    return modelo_de_lenguaje(f"Respondé usando solo esto:\n{contexto}\n\nPregunta: {pregunta}")`,
        },
      ],
    },
    {
      heading: "Errores que comete casi todo el mundo",
      parrafos: [
        "Los que más arruinan los resultados:",
      ],
      lista: [
        "Mezclar modelos: guardar con un modelo y consultar con otro. Los vectores de modelos distintos no son comparables; hay que recalcular todo si cambiás.",
        "Métrica distinta en la consulta y en el índice: el índice no se usa o los resultados no son los esperados. Verificá que la clase del índice (cosine_ops, l2_ops) coincida con el operador (<=>, <->).",
        "Fragmentos mal cortados: demasiado chicos pierden contexto, demasiado grandes diluyen el significado.",
        "No medir: asumir que \"parece que anda\". Armá un conjunto de preguntas con su respuesta esperada y comprobá qué porcentaje recupera.",
        "Usar búsqueda vectorial donde alcanza la de texto: para códigos de producto, nombres propios o números exactos, el texto completo es mejor. Muchas veces conviene combinar las dos.",
        "Filtrar después de buscar: con un índice aproximado, aplicar un filtro estricto puede dejar casi sin resultados. Probalo con tus filtros reales.",
        "Olvidar que los datos privados se envían a un servicio de embeddings externo: revisá qué sale de tu sistema.",
      ],
      codigo: [
        code`
-- índice de coseno...
CREATE INDEX ON documentos USING hnsw (embedding vector_cosine_ops);

-- ...pero la consulta usa L2: el índice no sirve para esta consulta
SELECT id FROM documentos ORDER BY embedding <-> '[0.1, 0.2, 0.3]' LIMIT 5;

-- correcto: mismo operador que el índice
SELECT id FROM documentos ORDER BY embedding <=> '[0.1, 0.2, 0.3]' LIMIT 5;`,
      ],
    },
    {
      heading: "Dónde conviene usarlas y dónde no",
      parrafos: [
        "Depende del volumen y de qué más necesite tu aplicación:",
      ],
      tabla: {
        cabeza: ["Caso", "¿Búsqueda vectorial?", "Por qué"],
        filas: [
          ["Búsqueda semántica en documentos o ayuda", "Sí", "Encuentra por significado aunque no coincidan las palabras."],
          ["RAG: un asistente que responde con tus datos", "Sí", "Es la forma de darle contexto propio al modelo."],
          ["Recomendaciones de productos o contenido parecido", "Sí", "Los elementos similares quedan cerca."],
          ["Detección de duplicados casi iguales", "Sí", "La distancia pequeña indica parecido."],
          ["Buscar un número de pedido o un código exacto", "No", "La búsqueda exacta o de texto es más precisa."],
          ["Pocos miles de documentos", "pgvector o incluso sin índice", "No hace falta infraestructura aparte."],
          ["Cientos de millones de vectores con baja latencia", "Base dedicada", "Escala horizontal y optimizaciones propias."],
        ],
      },
    },
    {
      heading: "Comparación: pgvector o una base dedicada",
      parrafos: [
        "La pregunta más frecuente es si hace falta una base de vectores aparte. Una guía razonable:",
      ],
      tabla: {
        cabeza: ["Opción", "Conviene cuando…"],
        filas: [
          ["pgvector (PostgreSQL)", "tus datos ya están en PostgreSQL y querés filtros, transacciones y vectores en un solo lugar. Cubre bien volúmenes de decenas de miles a millones de vectores; medilo con tus datos."],
          ["Qdrant, Milvus, Weaviate", "el volumen es muy grande, o necesitás escala horizontal, filtros avanzados o funciones específicas de búsqueda vectorial."],
          ["Pinecone", "querés un servicio administrado, sin operar nada vos."],
          ["Elasticsearch o MongoDB Atlas", "ya los usás para búsqueda o documentos y querés sumar vectores sin otro sistema."],
        ],
      },
    },
    {
      heading: "Cómo seguir",
      parrafos: [
        "Usá la pestaña Referencia de este tema para recordar los comandos de pgvector. Para practicar, tomá un conjunto chico de documentos propios, calculá sus embeddings con un modelo (hay servicios y modelos gratuitos que corren en tu computadora) y armá la búsqueda semántica con una tabla en PostgreSQL.",
        "El repositorio de pgvector tiene una documentación clara con todos los operadores, índices y parámetros. Antes de elegir una base dedicada, medí el recall y la latencia de pgvector con tus propios datos: puede alcanzarte.",
      ],
    },
  ],
  fuentes: [
    { texto: "pgvector (repositorio oficial)", url: "https://github.com/pgvector/pgvector" },
    { texto: "Artículo de HNSW (Malkov y Yashunin)", url: "https://arxiv.org/abs/1603.09320" },
    { texto: "Artículo de word2vec (Mikolov y otros)", url: "https://arxiv.org/abs/1301.3781" },
  ],
  revisada: "2026-11-12",
};

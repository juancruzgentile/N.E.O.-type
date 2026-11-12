import { type Topic, a, b, code, m } from "./types";
import { claseVectoriales } from "./clases/vectoriales";

export const vectoriales: Topic = {
  id: "vectoriales",
  name: "Bases de datos vectoriales",
  group: "Bases de datos",
  emblem: null,
  badge: "VC",
  color: "#b47bff",
  hl: "sql",
  summary:
    "Una base de datos vectorial guarda embeddings (listas de números que representan el significado de un texto, una imagen o un audio) y busca por similitud. Es la pieza detrás de la búsqueda semántica y de RAG. " +
    "Los ejemplos usan pgvector, la extensión de PostgreSQL, que es la forma más simple de empezar.",
  facts: [
    { label: "Qué guarda", value: "embeddings: vectores de cientos o miles de números" },
    { label: "Búsqueda", value: "vecinos más cercanos (exacta o aproximada)" },
    { label: "Índices", value: "HNSW · IVFFlat" },
    { label: "Opciones", value: "pgvector · Qdrant · Milvus · Weaviate · Pinecone" },
  ],
  workflow: [
    { title: "Un solo modelo de embeddings", text: "Los vectores del texto guardado y los de la consulta tienen que salir del mismo modelo. Si cambiás de modelo, hay que recalcular todo." },
    { title: "La métrica del índice y la de la consulta, iguales", text: "Si el índice se creó para distancia coseno y consultás con L2, el índice no se usa o da resultados inconsistentes." },
    { title: "Medí la calidad, no solo la velocidad", text: "La búsqueda aproximada puede dejar afuera resultados correctos. Compará contra la exacta con tus propias consultas." },
    { title: "Guardá el texto original", text: "El vector no se puede convertir de vuelta en texto. Guardá el fragmento, su origen y la versión del modelo junto al embedding." },
    { title: "Empezá por lo simple", text: "Con pgvector, los vectores viven junto a tus datos, con transacciones y filtros comunes. Una base dedicada se justifica con mucho volumen o requisitos específicos." },
  ],
  entries: [
    b("Empezar", "Crear la extensión y la columna", "La extensión agrega el tipo vector(n), con la cantidad de dimensiones del modelo de embeddings (por ejemplo 1536).", code`
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE documentos (
  id        bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  contenido text NOT NULL,
  embedding vector(3)      -- 3 dimensiones solo para el ejemplo
);`, "pgvector extension vector columna dimensiones embedding"),
    b("Empezar", "Insertar y leer vectores", "Un vector se escribe como un arreglo entre corchetes. En una aplicación real lo calcula un modelo de embeddings y se pasa como parámetro.", code`
INSERT INTO documentos (contenido, embedding) VALUES
  ('gatos y perros', '[0.9, 0.1, 0.0]'),
  ('mascotas del hogar', '[0.8, 0.2, 0.1]'),
  ('impuestos y facturas', '[0.0, 0.1, 0.9]');

SELECT id, contenido, embedding FROM documentos;`, "insertar vector arreglo embedding cargar"),
    b("Buscar", "Vecinos más cercanos: ORDER BY", "Buscar por similitud es ordenar por distancia al vector de la consulta y quedarse con los primeros. Sin índice recorre todo, y el resultado es exacto.", code`
SELECT contenido, embedding <=> '[0.85, 0.15, 0.05]' AS distancia
FROM documentos
ORDER BY embedding <=> '[0.85, 0.15, 0.05]'
LIMIT 2;`, "vecinos cercanos knn similitud busqueda order by distancia"),
    m("Buscar", "Elegir la métrica", "<-> es la distancia euclidiana (L2), <=> la distancia coseno y <#> el producto interno negativo. El coseno compara la dirección e ignora el largo; es la más usada con texto.", code`
SELECT embedding <-> '[1, 0, 0]' AS l2,
       embedding <=> '[1, 0, 0]' AS coseno,
       (embedding <#> '[1, 0, 0]') * -1 AS producto_interno
FROM documentos;

-- similitud coseno = 1 - distancia coseno
SELECT 1 - (embedding <=> '[1, 0, 0]') AS similitud FROM documentos;`, "metrica coseno l2 euclidiana producto interno distancia"),
    m("Índices", "Índice HNSW", "HNSW arma un grafo de vecinos en varias capas y busca de forma aproximada y rápida. m es cuántos vecinos guarda cada nodo y ef_construction cuánto esfuerzo pone al armarlo.", code`
CREATE INDEX idx_doc_hnsw ON documentos
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- la clase de operador tiene que coincidir con la métrica de la consulta (<=> = coseno)`, "hnsw indice grafo aproximado ann cosine ops"),
    m("Índices", "Índice IVFFlat", "IVFFlat divide los vectores en grupos (lists) y busca solo en los más cercanos (probes). Se construye después de cargar los datos, porque necesita ejemplos para formar los grupos.", code`
CREATE INDEX idx_doc_ivf ON documentos
  USING ivfflat (embedding vector_l2_ops)
  WITH (lists = 100);

SET ivfflat.probes = 10;   -- cuántos grupos revisa cada consulta`, "ivfflat indice lists probes aproximado"),
    m("Buscar", "Filtrar por metadatos y similitud", "Casi siempre se combina la similitud con filtros comunes (el usuario, la fecha, el idioma). Con un índice aproximado, filtrar puede dejar menos resultados de los pedidos.", code`
SELECT contenido
FROM documentos
WHERE idioma = 'es' AND creado > now() - interval '30 days'
ORDER BY embedding <=> '[0.85, 0.15, 0.05]'
LIMIT 5;

-- un índice común sobre las columnas del filtro ayuda
CREATE INDEX idx_doc_idioma ON documentos (idioma, creado);`, "filtro metadatos where similitud hibrido"),
    m("Buscar", "Búsqueda híbrida: texto y vectores", "El texto completo encuentra las palabras exactas y los vectores el significado. Se combinan sumando el puesto de cada resultado en ambas listas (reciprocal rank fusion).", code`
WITH texto AS (
  SELECT id, row_number() OVER (ORDER BY ts_rank(busqueda, q) DESC) AS puesto
  FROM documentos, plainto_tsquery('spanish', 'facturas') q
  WHERE busqueda @@ q
  ORDER BY puesto LIMIT 20
), vectores AS (
  SELECT id, row_number() OVER (ORDER BY embedding <=> '[0.0, 0.1, 0.9]') AS puesto
  FROM documentos
  ORDER BY puesto LIMIT 20
)
SELECT id, sum(1.0 / (60 + puesto)) AS puntaje
FROM (SELECT * FROM texto UNION ALL SELECT * FROM vectores) t
GROUP BY id ORDER BY puntaje DESC LIMIT 5;`, "hibrida texto vectores rrf fusion ranking"),
    a("Afinar", "Calidad contra velocidad: ef_search y probes", "Un índice aproximado cambia exactitud por velocidad. hnsw.ef_search (HNSW) y ivfflat.probes (IVFFlat) controlan cuánto busca cada consulta: más es más exacto y más lento.", code`
SET hnsw.ef_search = 100;      -- por defecto 40
-- más alto: mejor recall, consulta más lenta

SET ivfflat.probes = 20;       -- por defecto 1`, "recall ef_search probes afinar calidad velocidad"),
    a("Afinar", "Medir el recall contra la búsqueda exacta", "El recall es qué fracción de los verdaderos vecinos más cercanos devuelve el índice. Se mide comparando con la búsqueda sin índice.", code`
-- exacta: sin usar índice
BEGIN;
SET LOCAL enable_indexscan = off;
SELECT id FROM documentos ORDER BY embedding <=> '[0.85, 0.15, 0.05]' LIMIT 10;
COMMIT;

-- aproximada: con el índice
SELECT id FROM documentos ORDER BY embedding <=> '[0.85, 0.15, 0.05]' LIMIT 10;
-- recall = ids en común / 10`, "recall exacta aproximada medir calidad"),
    a("Almacenamiento", "halfvec: la mitad de espacio", "halfvec guarda cada número con 16 bits en vez de 32. El índice ocupa la mitad con una pérdida de exactitud casi siempre despreciable.", code`
CREATE TABLE documentos_medio (
  id        bigint PRIMARY KEY,
  embedding halfvec(1536)
);

CREATE INDEX ON documentos_medio USING hnsw (embedding halfvec_cosine_ops);`, "halfvec precision mitad espacio memoria"),
    a("RAG", "Guardar fragmentos para RAG", "Para RAG se corta cada documento en fragmentos, cada uno con su embedding. Al preguntar, se recuperan los más parecidos y se le pasan al modelo como contexto.", code`
CREATE TABLE fragmentos (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  documento_id bigint NOT NULL,
  posicion     int NOT NULL,
  texto        text NOT NULL,
  modelo       text NOT NULL,        -- con qué modelo se calculó el embedding
  embedding    vector(1536) NOT NULL
);

SELECT texto FROM fragmentos
ORDER BY embedding <=> $1 LIMIT 5;   -- $1 = embedding de la pregunta`, "rag fragmentos chunks recuperar contexto"),
  ],
  clase: claseVectoriales,
};

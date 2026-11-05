import type { FuentesTema } from "./tipos";

const R = "https://react.dev/";
export const react: FuentesTema = {
  version: "React 19",
  entradas: {
    "Componente y JSX": [R + "learn/writing-markup-with-jsx"],
    "Props con tipos": [R + "learn/passing-props-to-a-component"],
    "useState": [R + "reference/react/useState"],
    "Listas con key": [R + "learn/rendering-lists"],
    "Formulario controlado": [R + "reference/react-dom/components/input#controlling-an-input-with-a-state-variable"],
    "useEffect y fetch": [R + "reference/react/useEffect"],
    "Hook propio": [R + "learn/reusing-logic-with-custom-hooks"],
    "Context": [R + "learn/passing-data-deeply-with-context"],
    "useReducer": [R + "reference/react/useReducer"],
    "useMemo y memo": [R + "reference/react/useMemo"],
    "React Router": ["https://reactrouter.com/"],
    "Vite y tests": ["https://vite.dev/guide/"],
  },
};

const F = "https://fastapi.tiangolo.com/";
export const fastapi: FuentesTema = {
  version: "FastAPI 0.1xx",
  entradas: {
    "App y rutas": [F + "tutorial/first-steps/"],
    "Parámetros de ruta y de query": [F + "tutorial/path-params/"],
    "Cuerpo con Pydantic": [F + "tutorial/body/"],
    "HTTPException": [F + "tutorial/handling-errors/"],
    "Depends": [F + "tutorial/dependencies/"],
    "APIRouter": [F + "tutorial/bigger-applications/"],
    "response_model": [F + "tutorial/response-model/"],
    "fastapi dev": [F + "fastapi-cli/"],
    "Base de datos con SQLModel": [F + "tutorial/sql-databases/"],
    "async def y tareas en segundo plano": [F + "tutorial/background-tasks/"],
    "lifespan": [F + "advanced/events/"],
    "TestClient": [F + "tutorial/testing/"],
  },
};

const D = "https://docs.djangoproject.com/en/5.2/";
export const django: FuentesTema = {
  version: "Django 5.2 LTS",
  entradas: {
    "Modelos": [D + "topics/db/models/"],
    "Vistas": [D + "topics/http/views/"],
    "urls.py": [D + "topics/http/urls/"],
    "manage.py": [D + "ref/django-admin/"],
    "Consultas": [D + "topics/db/queries/"],
    "Relaciones": [D + "ref/models/relations/"],
    "Panel de administración": [D + "ref/contrib/admin/"],
    "ModelForm": [D + "topics/forms/modelforms/"],
    "login_required y permisos": [D + "topics/auth/default/"],
    "Vistas basadas en clases": [D + "topics/class-based-views/"],
    "Transacciones y F": [D + "topics/db/transactions/"],
    "TestCase": [D + "topics/testing/overview/"],
  },
};

const S = "https://docs.spring.io/spring-framework/reference/";
export const spring: FuentesTema = {
  version: "Spring Boot 3.5 · Java 21",
  entradas: {
    "@SpringBootApplication": ["https://docs.spring.io/spring-boot/reference/using/using-the-springbootapplication-annotation.html"],
    "@RestController": [S + "web/webmvc/mvc-controller/ann.html"],
    "DTO con record": [S + "web/webmvc/mvc-controller/ann-methods/requestbody.html"],
    "Maven wrapper": ["https://maven.apache.org/wrapper/"],
    "@Service e inyección": [S + "core/beans/annotation-config.html"],
    "Entidad JPA": ["https://docs.spring.io/spring-data/jpa/reference/jpa.html"],
    "Repositorios": ["https://docs.spring.io/spring-data/jpa/reference/repositories/core-concepts.html"],
    "Validación": [S + "core/validation/beanvalidation.html"],
    "@ConfigurationProperties": ["https://docs.spring.io/spring-boot/reference/features/external-config.html"],
    "Manejo de errores": [S + "web/webmvc/mvc-controller/ann-exceptionhandler.html"],
    "@Transactional": [S + "data-access/transaction/declarative/annotations.html"],
    "Tests con MockMvc": [S + "testing/mockmvc.html"],
  },
};

const A = "https://learn.microsoft.com/en-us/aspnet/core/";
export const aspnet: FuentesTema = {
  version: ".NET 10 LTS",
  entradas: {
    "Minimal API": [A + "fundamentals/minimal-apis/overview"],
    "Results y códigos HTTP": [A + "fundamentals/minimal-apis/responses"],
    "Records como DTO": [A + "tutorials/min-web-api"],
    "dotnet CLI": ["https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-new"],
    "Inyección de dependencias": [A + "fundamentals/dependency-injection"],
    "Entity Framework Core": ["https://learn.microsoft.com/en-us/ef/core/"],
    "Grupos de rutas": [A + "fundamentals/minimal-apis/route-handlers"],
    "Opciones tipadas": [A + "fundamentals/configuration/options"],
    "Autenticación con JWT": [A + "security/authentication/configure-jwt-bearer-authentication"],
    "Middleware": [A + "fundamentals/middleware/"],
    "Controladores": [A + "web-api/"],
    "WebApplicationFactory": [A + "test/integration-tests"],
  },
};

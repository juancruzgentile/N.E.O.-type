import { type Clase, code } from "../types";

export const claseDjango: Clase = {
  titulo: "Django de cero: el framework con todo incluido para la web",
  bajada:
    "La referencia rápida está en la otra pestaña. Esta es la clase completa: qué trae Django de fábrica, cómo viaja un pedido por dentro, tu primera aplicación, " +
    "los conceptos base, los errores clásicos y cuándo conviene.",
  secciones: [
    {
      heading: "Qué es y qué problema resuelve",
      parrafos: [
        "Django es un framework web de Python, de los llamados \"con baterías incluidas\": trae un mapeador de objetos a base de datos (ORM), un sistema de migraciones, plantillas HTML, formularios, autenticación de usuarios, un panel de administración generado automáticamente y protección contra los ataques web más comunes. Se usa para sitios con usuarios y contenido, aplicaciones de negocio, redes sociales y paneles internos.",
        "El problema que resuelve es que casi toda aplicación web necesita las mismas piezas, y armarlas desde cero cada vez es lento y fácil de hacer mal (sobre todo lo de seguridad). Django las trae resueltas, integradas entre sí y bien probadas, para que te concentres en lo propio de tu proyecto. Su lema: \"el framework web para perfeccionistas con plazos\".",
      ],
    },
    {
      heading: "Historia corta",
      parrafos: [
        "Nació en 2003 en el diario Lawrence Journal-World de Kansas, donde Adrian Holovaty y Simon Willison necesitaban construir sitios de noticias muy rápido. Se publicó como código abierto en 2005 y se llama así por el guitarrista de jazz Django Reinhardt. La Django Software Foundation, que lo mantiene, se fundó en 2008, año en que salió la versión 1.0.",
      ],
      lista: [
        "Cada versión LTS (soporte largo) se mantiene durante varios años; la de referencia en la app es Django 5.2 LTS.",
        "Su política de versiones es estricta: las funciones se avisan como obsoletas antes de quitarse.",
        "Instagram y Pinterest se construyeron sobre Django, lo que demostró que escala.",
      ],
    },
    {
      heading: "Cómo funciona por dentro: el camino de un pedido",
      parrafos: [
        "Django organiza el código con un patrón parecido a MVC, que llama MTV (modelo, plantilla, vista). Cuando llega un pedido, pasa por una cadena de middleware (seguridad, sesiones, CSRF), después el resolvedor de URLs busca en urls.py cuál es la vista que corresponde. La vista es una función (o clase) de Python que recibe el pedido, consulta los modelos, y devuelve una respuesta: casi siempre una plantilla HTML con datos.",
        "Los modelos son clases de Python que representan tablas. El ORM traduce las operaciones sobre objetos (Libro.objects.filter(...)) a consultas SQL, y las migraciones son archivos que registran cada cambio de estructura para aplicarlo igual en todos los entornos. Con el panel de administración, cada modelo que registres tiene una interfaz web de alta, baja y modificación sin escribir una línea de HTML.",
      ],
    },
    {
      heading: "Tu primera aplicación, paso a paso",
      parrafos: [
        "En una carpeta con un entorno virtual: pip install django, django-admin startproject sitio y dentro python manage.py startapp libros. Agregá \"libros\" a INSTALLED_APPS en sitio/settings.py. Estos son los tres archivos.",
      ],
      codigo: [
        code`
# libros/models.py
from django.db import models

class Libro(models.Model):
    titulo = models.CharField(max_length=100)
    paginas = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.titulo

# libros/views.py
from django.shortcuts import render
from .models import Libro

def lista(request):
    libros = Libro.objects.filter(paginas__gt=200).order_by("titulo")
    return render(request, "libros/lista.html", {"libros": libros})

# sitio/urls.py
from django.urls import path
from libros import views

urlpatterns = [path("libros/", views.lista, name="lista")]`,
      ],
    },
    {
      heading: "Qué hace cada parte",
      parrafos: [
        "El modelo Libro describe una tabla con dos columnas; Django le agrega la clave primaria sola. Después de escribirlo, python manage.py makemigrations crea el archivo de migración y python manage.py migrate lo aplica a la base de datos. En la vista, Libro.objects.filter(paginas__gt=200) significa \"los libros con más de 200 páginas\" (el doble guion bajo es el operador \"mayor que\"), y render junta la plantilla con los datos.",
        "Falta crear templates/libros/lista.html dentro de la app, con un bucle {% for libro in libros %}...{% endfor %} que muestre cada título. Con python manage.py runserver abrís http://127.0.0.1:8000/libros/. Y con python manage.py createsuperuser y el modelo registrado en admin.py, tenés el panel completo en /admin/.",
      ],
    },
    {
      heading: "Los cinco conceptos que sostienen todo lo demás",
      parrafos: [
        "Con estos cinco leés casi cualquier proyecto Django:",
      ],
      lista: [
        "Modelos y ORM: clases que son tablas; filter, get, exclude y order_by arman las consultas, y las relaciones son ForeignKey y ManyToManyField.",
        "Migraciones: cada cambio de un modelo se registra con makemigrations y se aplica con migrate.",
        "URLs y vistas: urls.py enlaza una ruta con una vista; las vistas basadas en clases evitan repetir código común.",
        "Plantillas: HTML con etiquetas {% %} y variables {{ }}, con escape automático contra XSS.",
        "Admin y formularios: el panel de administración y los formularios validan datos y generan los campos desde los modelos.",
      ],
      codigo: [
        code`
# relaciones y consultas
class Autor(models.Model):
    nombre = models.CharField(max_length=80)

class Libro(models.Model):
    titulo = models.CharField(max_length=100)
    autor = models.ForeignKey(Autor, on_delete=models.CASCADE, related_name="libros")

autor = Autor.objects.get(nombre="Austen")
autor.libros.all()                        # los libros de ese autor
Libro.objects.filter(titulo__icontains="dune").exists()`,
      ],
    },
    {
      heading: "Errores que comete casi todo el mundo",
      parrafos: [
        "Los más repetidos:",
      ],
      lista: [
        "El problema N+1: recorrer una lista y consultar una relación en cada vuelta hace una consulta por elemento. Usá select_related (para ForeignKey) o prefetch_related (para muchos a muchos).",
        "Cambiar un modelo y olvidar makemigrations y migrate: el código espera columnas que no existen.",
        "Subir a producción con DEBUG = True o con SECRET_KEY en el repositorio: expone datos internos y rompe la seguridad de las sesiones. Sacalos a variables de entorno.",
        "Usar get() sin manejar DoesNotExist: si el objeto no está, la vista falla con un error 500. Usá get_object_or_404.",
        "Desactivar la protección CSRF para que \"ande\" un formulario: es una puerta abierta a ataques. Incluí {% csrf_token %} en el formulario.",
      ],
      codigo: [
        code`
# MAL: una consulta por cada libro para traer su autor
for libro in Libro.objects.all():
    print(libro.autor.nombre)

# BIEN: una sola consulta con JOIN
for libro in Libro.objects.select_related("autor"):
    print(libro.autor.nombre)`,
      ],
    },
    {
      heading: "Dónde conviene usarlo y dónde no",
      parrafos: [
        "Django brilla cuando necesitás mucho de lo que trae:",
      ],
      tabla: {
        cabeza: ["Caso", "¿Django?", "Por qué"],
        filas: [
          ["Sitios con usuarios, contenido y administración", "Sí", "Autenticación, admin y formularios ya resueltos."],
          ["Aplicaciones de negocio con base de datos relacional", "Sí", "ORM y migraciones muy maduros."],
          ["Proyectos que deben ser seguros desde el principio", "Sí", "Protege contra CSRF, XSS e inyección SQL por defecto."],
          ["Un microservicio mínimo con dos rutas", "No ideal", "Es más pesado que lo que hace falta; FastAPI o Flask alcanzan."],
          ["APIs con documentación y validación por tipos", "Posible", "Con Django REST Framework o Django Ninja; FastAPI lo trae de fábrica."],
          ["Aplicaciones en tiempo real con muchas conexiones", "Con Channels", "Su modelo base es de pedido y respuesta."],
        ],
      },
    },
    {
      heading: "Comparación con alternativas",
      parrafos: [
        "Cuándo conviene otra cosa:",
      ],
      tabla: {
        cabeza: ["Alternativa", "Elegila en vez de Django cuando…"],
        filas: [
          ["FastAPI", "es una API moderna con tipos, sin páginas ni administración."],
          ["Flask", "querés un núcleo mínimo y elegir cada pieza."],
          ["Ruby on Rails o Laravel", "tu equipo ya está en Ruby o PHP; la filosofía es muy parecida."],
          ["Spring Boot o ASP.NET Core", "el entorno es empresarial en Java o .NET."],
        ],
      },
    },
    {
      heading: "Cómo seguir",
      parrafos: [
        "Hacé el proyecto de Django de la app (un blog) y usá la pestaña Referencia para la sintaxis del ORM y de las plantillas.",
        "Fuera de la app, el tutorial oficial de seis partes (crear una aplicación de encuestas) es uno de los mejores de cualquier framework, y la documentación explica todo con detalle. Antes de publicar, la lista de verificación de despliegue (python manage.py check --deploy) te dice qué falta.",
      ],
    },
  ],
  fuentes: [
    { texto: "Tutorial de Django", url: "https://docs.djangoproject.com/en/stable/intro/tutorial01/" },
    { texto: "Documentación de Django", url: "https://docs.djangoproject.com/en/stable/" },
    { texto: "Lista de verificación de despliegue", url: "https://docs.djangoproject.com/en/stable/howto/deployment/checklist/" },
  ],
  revisada: "2026-11-12",
};

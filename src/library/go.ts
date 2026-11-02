import { type Topic, a, b, code, m } from "./types";

export const go: Topic = {
  id: "go",
  name: "Go",
  group: "Lenguajes",
  emblem: "go",
  badge: "Go",
  color: "#00add8",
  hl: "go",
  summary:
    "Lenguaje compilado de Google, simple a propósito: pocas palabras clave, compilación muy rápida y concurrencia incluida (goroutines y canales). " +
    "Es el lenguaje de Docker, Kubernetes y gran parte de la infraestructura en la nube.",
  facts: [
    { label: "Archivos", value: ".go · go.mod" },
    { label: "Ejecutar", value: "go run . · go build" },
    { label: "Paquetes", value: "módulos (go get)" },
    { label: "Formato", value: "gofmt · tabulaciones" },
    { label: "Errores", value: "valores error, sin excepciones" },
  ],
  workflow: [
    { title: "Un módulo por proyecto", text: "go mod init github.com/vos/proyecto crea go.mod. go mod tidy agrega lo que falta y quita lo que sobra." },
    { title: "gofmt no se discute", text: "Todo el código Go se formatea igual (tabulaciones incluidas). Configurá el editor para correr gofmt al guardar." },
    { title: "Errores explícitos", text: "Cada función que puede fallar devuelve un error; revisalo enseguida con if err != nil y agregá contexto con fmt.Errorf(\"...: %w\", err)." },
    { title: "go vet y tests", text: "go vet ./... detecta errores sutiles; go test ./... corre los archivos _test.go." },
    { title: "Estructura", text: "cmd/app/main.go para el ejecutable, internal/ para paquetes privados. Mantené los paquetes chicos y con nombres cortos." },
  ],
  entries: [
    b("Estructura", "package main y func main", "Todo archivo pertenece a un paquete. El ejecutable arranca en func main del paquete main.", code`
package main

import "fmt"

func main() {
	fmt.Println("Hola, mundo")
}`, "inicio programa main"),
    b("Datos", "Variables: var y :=", ":= declara e infiere dentro de funciones. var sirve a nivel de paquete o para el valor cero.", code`
var contador int          // 0
nombre := "Ana"
edad, activo := 30, true
const Pi = 3.14159`, "variable declarar constante"),
    b("Funciones", "func y múltiples retornos", "Las funciones pueden devolver varios valores; el último suele ser un error.", code`
func dividir(a, b float64) (float64, error) {
	if b == 0 {
		return 0, errors.New("división por cero")
	}
	return a / b, nil
}`, "funcion retorno multiple"),
    b("Control de flujo", "if y for", "for es el único bucle (también hace de while). if puede declarar una variable antes de la condición.", code`
for i := 0; i < 3; i++ {
	fmt.Println(i)
}
for activo {
	activo = procesar()
}
if n, err := strconv.Atoi(s); err == nil {
	fmt.Println(n)
}`, "bucle condicional while"),
    b("Colecciones", "Slices", "Listas dinámicas. append agrega (y puede crear un arreglo nuevo, por eso se reasigna).", code`
nums := []int{3, 1, 2}
nums = append(nums, 4)
parte := nums[1:3]
for i, n := range nums {
	fmt.Println(i, n)
}`, "slice lista array append"),
    b("Colecciones", "Maps", "Diccionarios. La forma con dos valores dice si la clave existe.", code`
edades := map[string]int{"ana": 30}
edades["luis"] = 25
if edad, ok := edades["eva"]; !ok {
	fmt.Println("no está", edad)
}
delete(edades, "ana")`, "mapa diccionario"),
    b("Entrada y salida", "fmt.Printf", "Formato con verbos: %v (cualquier valor), %d, %s, %.2f, %q y %T (tipo).", code`
fmt.Printf("%s tiene %d años\n", nombre, edad)
fmt.Printf("%v %+v %T\n", p, p, p)
s := fmt.Sprintf("%.2f", precio)`, "imprimir formato"),

    m("Tipos", "struct y métodos", "Los structs agrupan campos; los métodos se declaran con un receptor (puntero si modifican).", code`
type Cuenta struct {
	Titular string
	saldo   float64
}

func (c *Cuenta) Depositar(monto float64) {
	c.saldo += monto
}`, "estructura metodo receptor"),
    m("Tipos", "interface", "Se cumplen implícitamente: cualquier tipo con esos métodos implementa la interfaz.", code`
type Forma interface {
	Area() float64
}

type Circulo struct{ R float64 }

func (c Circulo) Area() float64 { return math.Pi * c.R * c.R }`, "interfaz implicita"),
    m("Errores", "if err != nil y %w", "El manejo de errores es explícito. %w envuelve el error original para poder inspeccionarlo con errors.Is/As.", code`
datos, err := os.ReadFile(ruta)
if err != nil {
	return fmt.Errorf("leyendo %s: %w", ruta, err)
}
if errors.Is(err, fs.ErrNotExist) { /* ... */ }`, "error manejo wrap"),
    m("Recursos", "defer", "Posterga una llamada hasta que la función termina. Ideal para cerrar archivos o liberar locks.", code`
f, err := os.Open("datos.txt")
if err != nil {
	return err
}
defer f.Close()`, "cerrar diferir"),
    m("Paquetes", "Módulos y go get", "Dependencias por módulo; las versiones quedan en go.mod y go.sum.", code`
go mod init github.com/ana/app
go get github.com/google/uuid@latest
go mod tidy
go build ./...`, "modulo dependencias"),
    m("Datos", "encoding/json", "Etiquetas de struct para mapear campos JSON.", code`
type Tarea struct {
	ID     int    \`json:"id"\`
	Titulo string \`json:"titulo"\`
	Hecha  bool   \`json:"hecha,omitempty"\`
}
b, _ := json.Marshal(t)
err := json.Unmarshal(b, &t)`, "json serializar tags"),

    m("Concurrencia", "Goroutines", "go f() lanza una función concurrente muy liviana. sync.WaitGroup espera a que terminen.", code`
var wg sync.WaitGroup
for _, url := range urls {
	wg.Add(1)
	go func() {
		defer wg.Done()
		descargar(url)
	}()
}
wg.Wait()`, "concurrencia hilos paralelo"),
    a("Concurrencia", "Canales y select", "Los canales comunican goroutines. select espera en varios a la vez (por ejemplo con un timeout).", code`
resultados := make(chan string)
go func() { resultados <- trabajar() }()

select {
case r := <-resultados:
	fmt.Println(r)
case <-time.After(2 * time.Second):
	fmt.Println("timeout")
}`, "channel canal select"),
    a("Concurrencia", "context", "Propaga cancelación y plazos a través de llamadas (pedidos HTTP, consultas).", code`
ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
defer cancel()
req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
res, err := http.DefaultClient.Do(req)`, "cancelacion timeout"),
    a("Genéricos", "Genéricos", "Funciones y tipos con parámetros de tipo y restricciones.", code`
func Map[T, U any](xs []T, f func(T) U) []U {
	out := make([]U, 0, len(xs))
	for _, x := range xs {
		out = append(out, f(x))
	}
	return out
}`, "generics tipos parametros"),
    a("Web", "net/http", "Servidor HTTP de la biblioteca estándar, con rutas por método.", code`
mux := http.NewServeMux()
mux.HandleFunc("GET /tareas/{id}", func(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	json.NewEncoder(w).Encode(map[string]string{"id": id})
})
log.Fatal(http.ListenAndServe(":8080", mux))`, "servidor api web http"),
    a("Calidad", "go test", "Tests en archivos _test.go; los table-driven tests son el estilo habitual.", code`
func TestDividir(t *testing.T) {
	casos := []struct{ a, b, want float64 }{{6, 3, 2}, {5, 2, 2.5}}
	for _, c := range casos {
		got, _ := dividir(c.a, c.b)
		if got != c.want {
			t.Errorf("dividir(%v, %v) = %v; want %v", c.a, c.b, got, c.want)
		}
	}
}`, "test prueba testing"),
  ],
};

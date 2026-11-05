import type { FuentesTema } from "./tipos";

const G = "https://go.dev/";
export const go: FuentesTema = {
  version: "Go 1.26",
  entradas: {
    "package main y func main": [G + "doc/tutorial/getting-started"],
    "Variables: var y :=": [G + "ref/spec#Short_variable_declarations"],
    "func y múltiples retornos": [G + "tour/basics/6"],
    "if y for": [G + "tour/flowcontrol/1"],
    "Slices": [G + "blog/slices-intro"],
    "Maps": [G + "blog/maps"],
    "fmt.Printf": ["https://pkg.go.dev/fmt"],
    "struct y métodos": [G + "tour/methods/1"],
    "interface": [G + "tour/methods/9"],
    "if err != nil y %w": [G + "blog/go1.13-errors", "Go 1.13"],
    "defer": [G + "blog/defer-panic-and-recover"],
    "Módulos y go get": [G + "doc/modules/managing-dependencies", "Go 1.11"],
    "encoding/json": ["https://pkg.go.dev/encoding/json"],
    "Goroutines": [G + "tour/concurrency/1"],
    "Canales y select": [G + "tour/concurrency/5"],
    "context": ["https://pkg.go.dev/context", "Go 1.7"],
    "Genéricos": [G + "doc/tutorial/generics", "Go 1.18"],
    "net/http": ["https://pkg.go.dev/net/http"],
    "go test": [G + "doc/tutorial/add-a-test"],
  },
};

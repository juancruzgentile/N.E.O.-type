import type { FuentesTema } from "./tipos";

const S = "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/";
export const swift: FuentesTema = {
  version: "Swift 6 · Xcode 26",
  entradas: {
    "let, var y tipos": [S + "thebasics/"],
    "Interpolación": [S + "stringsandcharacters/"],
    "if, for y switch": [S + "controlflow/"],
    "func y etiquetas": [S + "functions/"],
    "Arrays y diccionarios": [S + "collectiontypes/"],
    "Opcionales": [S + "thebasics/"],
    "struct y class": [S + "classesandstructures/"],
    "enum con valores asociados": [S + "enumerations/"],
    "Closures": [S + "closures/"],
    "Protocolos": [S + "protocols/"],
    "throws y do/catch": [S + "errorhandling/"],
    "Swift Package Manager": ["https://www.swift.org/documentation/package-manager/"],
    "async/await": [S + "concurrency/", "Swift 5.5"],
    "actor": [S + "concurrency/", "Swift 5.5"],
    "Genéricos": [S + "generics/"],
    "Codable": ["https://developer.apple.com/documentation/foundation/encoding-and-decoding-custom-types", "Swift 4"],
    "SwiftUI": ["https://developer.apple.com/documentation/swiftui", "iOS 13"],
  },
};

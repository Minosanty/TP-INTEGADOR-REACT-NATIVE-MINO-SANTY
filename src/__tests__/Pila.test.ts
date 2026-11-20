import { Pila } from "../estructuras/Pila";

describe("Pila", () => {
  test("comienza vacía", () => expect(new Pila<string>().tamanio).toBe(0));
  test("apila y devuelve el tamaño", () => {
    const pila = new Pila<number>();
    pila.apilar(1);
    pila.apilar(2);
    expect(pila.tamanio).toBe(2);
  });
  test("devuelve el elemento del tope", () => {
    const pila = new Pila<string>();
    pila.apilar("uno");
    pila.apilar("dos");
    expect(pila.cima()).toBe("dos");
  });
  test("desapila el último elemento", () => {
    const pila = new Pila<string>();
    pila.apilar("uno");
    pila.apilar("dos");
    expect(pila.desapilar()).toBe("dos");
    expect(pila.tamanio).toBe(1);
  });
  test("devuelve una copia del contenido", () => {
    const pila = new Pila<number>();
    pila.apilar(3);
    const copia = pila.aArray();
    copia.push(4);
    expect(pila.tamanio).toBe(1);
  });
});

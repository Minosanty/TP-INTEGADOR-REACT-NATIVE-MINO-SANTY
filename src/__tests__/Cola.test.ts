import { Cola } from "../estructuras/Cola";

describe("Cola", () => {
  test("comienza vacía", () => expect(new Cola<string>().tamanio).toBe(0));
  test("encolar incrementa el tamaño", () => {
    const cola = new Cola<string>();
    cola.encolar("Ana");
    expect(cola.tamanio).toBe(1);
  });
  test("desencolar usa el orden de llegada", () => {
    const cola = new Cola<string>();
    cola.encolar("Ana");
    cola.encolar("Luis");
    expect(cola.desencolar()).toBe("Ana");
  });
  test("desencolar una cola vacía devuelve undefined", () => {
    expect(new Cola<string>().desencolar()).toBeUndefined();
  });
  test("frente no modifica la cola", () => {
    const cola = new Cola<string>();
    cola.encolar("Ana");
    expect(cola.frente()).toBe("Ana");
    expect(cola.tamanio).toBe(1);
  });
  test("devuelve una copia del contenido", () => {
    const cola = new Cola<string>();
    cola.encolar("Ana");
    const copia = cola.aArray();
    copia.push("Luis");
    expect(cola.tamanio).toBe(1);
  });
  test("mantiene el orden al desencolar y volver a encolar", () => {
    const cola = new Cola<number>();
    for (let valor = 0; valor < 40; valor += 1) cola.encolar(valor);
    for (let valor = 0; valor < 40; valor += 1) expect(cola.desencolar()).toBe(valor);
    cola.encolar(41);
    cola.encolar(42);
    expect(cola.aArray()).toEqual([41, 42]);
    expect(cola.desencolar()).toBe(41);
    expect(cola.desencolar()).toBe(42);
  });
});

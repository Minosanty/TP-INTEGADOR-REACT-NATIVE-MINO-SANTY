export class Pila<T> {
  #items: T[] = [];
  get tamanio(): number { return this.#items.length; }
  apilar(valor: T): void { this.#items.push(valor); }
  desapilar(): T | undefined { return this.#items.pop(); }
  cima(): T | undefined { return this.#items[this.#items.length - 1]; }
  aArray(): T[] { return [...this.#items]; }
}

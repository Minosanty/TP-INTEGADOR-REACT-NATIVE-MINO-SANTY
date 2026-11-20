export class Cola<T> {
  #items: T[] = [];
  #inicio = 0;
  get tamanio(): number { return this.#items.length - this.#inicio; }
  encolar(valor: T): void { this.#items.push(valor); }
  desencolar(): T | undefined {
    if (this.tamanio === 0) return undefined;
    const valor = this.#items[this.#inicio];
    this.#inicio += 1;
    if (this.#inicio > 32 && this.#inicio * 2 > this.#items.length) {
      this.#items = this.#items.slice(this.#inicio);
      this.#inicio = 0;
    }
    return valor;
  }
  frente(): T | undefined { return this.#items[this.#inicio]; }
  aArray(): T[] { return this.#items.slice(this.#inicio); }
}

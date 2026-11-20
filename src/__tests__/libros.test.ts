import { LIBROS } from "../data/libros";

describe("catálogo de ejemplo", () => {
  test("contiene al menos quince ISBN-13 únicos con dígito verificador correcto", () => {
    expect(LIBROS.length).toBeGreaterThanOrEqual(15);
    expect(new Set(LIBROS.map((libro) => libro.isbn)).size).toBe(LIBROS.length);

    for (const libro of LIBROS) {
      expect(libro.isbn).toMatch(/^\d{13}$/);
      const suma = [...libro.isbn.slice(0, 12)].reduce(
        (total, digito, indice) => total + Number(digito) * (indice % 2 === 0 ? 1 : 3),
        0,
      );
      expect(Number(libro.isbn[12])).toBe((10 - (suma % 10)) % 10);
    }
  });

  test("incluye dos ISBN de prueba válidos para EAN-13", () => {
    expect(LIBROS.some((libro) => libro.isbn === "9780547928227")).toBe(true);
    expect(LIBROS.some((libro) => libro.isbn === "9780451524935")).toBe(true);
  });
});

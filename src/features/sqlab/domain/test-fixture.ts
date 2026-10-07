import type { SqlabDocument } from "./document";
export const fixture: SqlabDocument = {
  version: 1,
  name: "Books",
  schema: {
    version: 1,
    tables: [
      {
        id: "t",
        name: "books",
        columns: [
          { id: "id", name: "id", type: "integer", primary: true },
          { id: "name", name: "title", type: "text", primary: false },
        ],
      },
    ],
    relations: [],
  },
  rows: { t: [{ id: 1, title: "Book" }] },
};

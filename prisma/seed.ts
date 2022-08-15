import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import axios from "axios";
import { faker } from "@faker-js/faker";
import slugify from "slugify";

async function main() {
  if (!prisma) throw new Error("prisma is not defined");

  const BOOK_SUBJECTS = [
    "Biography & Autobiography",
    "Science & Technology",
    "Novel",
    "Thriller",
    "Animals",
    "Fiction / General",
    "Fantasy Fiction",
  ];

  await prisma.collection.deleteMany();
  await prisma.book.deleteMany();
  await prisma.user.deleteMany({
    where: {
      email: {
        not: "raheelj2004@gmail.com",
      },
    },
  });

  await prisma.user.createMany({
    data: Array.from({ length: 10 }, (_) => {
      const name = faker.name.fullName();
      return {
        email: faker.internet.email(),
        name,
        image: faker.image.avatar(),
        slug: slugify(name, { lower: true }),
      };
    }),
  });

  const users = await prisma.user.findMany({
    select: {
      id: true,
    },
  });

  const bookQueries = await Promise.all(
    BOOK_SUBJECTS.map(async (subject) => {
      const books = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=subject:${subject}&maxResults=30`
      );
      return books.data.items.filter((book: any) =>
        Object.keys(book.volumeInfo).find((key) =>
          [
            "description",
            "title",
            "authors",
            "imageLinks",
            "avgRating",
          ].includes(key)
        )
      );
    })
  );
  const books = bookQueries.flat();

  await Promise.all(
    Array.from({ length: 30 }, async (_) => {
      const title = faker.lorem.sentence();
      const description = faker.lorem.paragraph();
      const randomUser = users[Math.floor(Math.random() * users.length)];
      if (!randomUser) throw new Error("randomUser is not defined");
      const randomBooks = Array.from({ length: 13 }, (_) => {
        return books[Math.floor(Math.random() * books.length)];
      });

      await prisma.book.createMany({
        data: randomBooks.map((book) => ({
          id: book.id,
          title: book.volumeInfo.title,
          description: book.volumeInfo.description || "",
          cover: book.volumeInfo.imageLinks?.thumbnail,
          link: book.volumeInfo.canonicalVolumeLink,
          authors: book.volumeInfo.authors?.join(", "),
          avgRating: book.volumeInfo?.avgRating,
        })),
        skipDuplicates: true,
      });

      await prisma.collection.create({
        data: {
          title,
          description,
          user: {
            connect: {
              id: randomUser.id,
            },
          },
          books: {
            connect: randomBooks.map((book) => ({ id: book.id })),
          },
        },
        select: {
          id: true,
        },
      });
    })
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });

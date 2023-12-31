"use client";
import axios from "axios";
import { BooksApiResponse, HomeProps } from "@/types";
import React, { useEffect, useRef, useState } from "react";
import BookCard from "./BookCard";
import { Loader } from ".";
import { filters, print, sorting, books_route, base_url } from "@/constants";
import ShowMore from "./ShowMore";

// const base_url = "http://localhost:8000/api/v1";
// const books_route = "books";

const BooksGrid = ({ searchParams }: HomeProps) => {
  const [data, setData] = useState<BooksApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const ref = useRef<HTMLInputElement | null>(null);

  async function fetchBooks() {
    console.log("API:", base_url);

    const query = searchParams.query;
    const filter = searchParams.filter;
    const printType = searchParams.print_type;
    const orderBy = searchParams.order_by;
    const countsPerPage = searchParams.count_per_page;

    if (!query || query.trim().length === 0) {
      setError(true);
      setErrorMessage("Enter your search query");
      return;
    }
    let url = `${base_url}/${books_route}/`;
    setLoading(true);

    try {
      const response = await axios({
        method: "get",
        url,
        withCredentials: false,
        params: {
          q: query,
          ...(filter &&
            filters.includes(filter) && {
              filter: filter,
            }),
          ...(printType &&
            print.find((x) => x.title === printType) && {
              print_type: printType,
            }),
          ...(orderBy &&
            sorting.find((x) => x.title === orderBy) && {
              order_by: orderBy,
            }),
          counts_per_page: countsPerPage ? countsPerPage : 12,
        },
      });

      setData(response.data);
      setSuccess(true);
      setSuccessMessage("Books fetched");
    } catch (error) {
      setError(true);
      console.log(error);
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(`Unknown Error:${error}`);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setError(false);
    setSuccess(false);
    setErrorMessage("");
    setSuccessMessage("");
    fetchBooks();
  }, [searchParams]);

  useEffect(() => {
    if (ref && ref.current /* + other conditions */) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [success]);

  console.log(data);
  const books = success && data ? data.items : [];
  const totalBooks = success && data ? data.totalItems : 0;
  const pageLimit = searchParams.count_per_page || 10;

  return (
    <>
      {loading && (
        <div ref={searchParams.query ? ref : null}>
          <Loader />
        </div>
      )}

      {books && books.length > 0 ? (
        <section>
          <div
            className="home__books-wrapper"
            ref={searchParams.query ? ref : null}
          >
            {books?.map((book) => (
              <BookCard book={book} key={book.id} />
            ))}
          </div>

          <ShowMore
            pageLimit={pageLimit}
            total={totalBooks}
            pageNumber={(searchParams.count_per_page || 10) / 10}
            isNext={(searchParams.count_per_page || 10) > books.length}
          />
        </section>
      ) : (
        !loading && (
          <div
            className="home__error-container"
            ref={searchParams.query ? ref : null}
          >
            <h2 className="text-black text-xl font-bold">No books to load</h2>
          </div>
        )
      )}
    </>
  );
};

export default BooksGrid;

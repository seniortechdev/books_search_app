"use client";
import axios from "axios";
import useAPIRequests from "@/hooks/useAPIRequests";
import { BooksApiResponse, HomeProps } from "@/types";
import React, { useEffect, useRef, useState } from "react";
import BookCard from "./BookCard";
import { Loader } from ".";
import ShowMore from "./ShowMore";

const base_url = "http://localhost:8000/api/v1";
const route = "books";

const BooksGrid = ({ searchParams }: HomeProps) => {
  const [data, setData] = useState<BooksApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const ref = useRef<HTMLInputElement | null>(null);

  async function fetchBooks() {
    const query = searchParams.query;
    console.log("Query:", query);
    if (!query || query.trim().length === 0) {
      setError(true);
      setErrorMessage("Enter your search query");
      return;
    }
    let url = `${base_url}/${route}/`;
    setLoading(true);

    try {
      const response = await axios({
        method: "get",
        url,
        withCredentials: false,
        params: {
          q: query,
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

  // const { data, loading, error, success } = useAPIRequests({
  //   query: searchParams.query ? searchParams.query : "",
  //   route: "books",
  // });

  const books = success && data ? data.items : [];
  books.forEach((book) => {
    console.log(book.volumeInfo);
  });

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

          {/* <ShowMore
              pageNumber={(searchParams.limit || 10) / 10}
              isNext={(searchParams.limit || 10) > data.length}
            /> */}
        </section>
      ) : (
        <div
          className="home__error-container"
          ref={searchParams.query ? ref : null}
        >
          <h2 className="text-black text-xl font-bold">Oops, no results</h2>
        </div>
      )}
    </>
  );
};

export default BooksGrid;
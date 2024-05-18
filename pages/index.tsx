import React, { useEffect, useState } from "react";
import CardsSheets from "../components/CardsSheets/CardsSheets";
import CategoryList from "../components/CategoryList/CategoryList";
import FilterDisplay from "../components/FilterDisplay/FilterDisplay";
import MapGl from "../components/Map/MapGl";
import TagsList from "../components/TagsList/TagsList";
import { DefaultLayout } from "../layouts/DefaultLayout/DefaultLayout";
import pagedata from "../texts/home.json";
import Blog from "../types/card.type";
import styles from "./Home/Home.module.scss";
import { fetchGoogleSheetData } from "./../hooks/data";
import { useRouter } from "next/router";

export async function getStaticProps() {
  const { blogs, updated } = await fetchGoogleSheetData();
  return {
    props: {
      blogs,
      updated,
    },
  };
}

export default function Home({ blogs, updated }) {
  const [category, setCategory] = useState<string>("");
  const [tag, setTag] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [entryPerPage, setEntryPerPage] = useState<number>(36);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);

  const router = useRouter();

  // watch for changes in tag, search and category and filter the blogs!
  useEffect(() => {
    const filtered = blogs
      .filter((blog: Blog) => blog.tags?.toLowerCase().includes(tag))
      .filter(
        (blog: Blog) =>
          blog.title?.toLowerCase().includes(searchQuery) ||
          blog.description?.toLowerCase().includes(searchQuery) ||
          blog.howtouse?.toLowerCase().includes(searchQuery) ||
          blog.invisible?.toLowerCase().includes(searchQuery)
      )
      .filter((blog: Blog) => blog.category?.toLowerCase().includes(category));
    setFilteredBlogs(filtered);
  }, [category, tag, searchQuery]);

  //read stuff from the url, only on initial load
  useEffect(() => {
    if (!router?.isReady) return;
    const category = router.query.category;
    const tag = router.query.tag;
    if (category) {
      onCategorySet(category as string);
    }
    if (tag) {
      onTagSet(tag as string);
    }
  }, [router.isReady]);

  // watch for chages in tag and category and update the URL
  useEffect(() => {
    if (category != "" && tag === "") {
      router.push(`/?category=${encodeURIComponent(category.toLowerCase())}`);
    }

    if (category != "" && tag != "") {
      router.push(
        `/?category=${encodeURIComponent(
          category.toLowerCase()
        )}&tag=${encodeURIComponent(tag.toLowerCase())}`
      );
    }
    if (category === "" && tag != "") {
      router.push(`/?tag=${encodeURIComponent(tag.toLowerCase())}`);
    }
    if (category === "" && tag === "") {
      router.push(`/`);
    }
  }, [category, tag]);

  const onCategorySet = (cat: string) => {
    if (category === cat) {
      setCategory("");
    } else {
      setCategory(cat.toLowerCase());
    }
  };

  const onTagSet = (t: string) => {
    setTag(t === tag ? "" : t.toLowerCase());
  };

  return (
    <DefaultLayout
      updated={updated}
      title={pagedata.title}
      description={pagedata.meta || pagedata.description}
      searchQuery={searchQuery}
      onSearchQueryChange={(query) => setSearchQuery(query.toLowerCase())}
      darkMode
    >
      <div className={styles.filtration}>
        <FilterDisplay
          category={category}
          onCloseCategoryClick={() => setCategory("")}
          tag={tag}
          onCloseTagClick={() => setTag("")}
          searchQuery={searchQuery}
          onCloseSearchClick={() => setSearchQuery("")}
          filteredLength={filteredBlogs.length}
        />
      </div>

      <div className={styles.menuSpace}></div>
      <div className={styles.menuSpaceFixed}></div>
      <MapGl posts={filteredBlogs} />

      <section style={{ marginTop: -40 }}>
        <div className={styles.tagsHolder}>
          <CategoryList
            posts={blogs}
            onCategoryClick={onCategorySet}
            category={category}
          />
          {blogs.length !== filteredBlogs.length && (
            <TagsList
              posts={filteredBlogs}
              onTagClick={onTagSet}
              tag={tag}
              category={category}
            />
          )}
        </div>
        <CardsSheets members={filteredBlogs.slice(0, entryPerPage)} />
        {entryPerPage < filteredBlogs.length && (
          <div className="flex-center-hor">
            <button onClick={() => setEntryPerPage(entryPerPage + 36)}>
              {pagedata.load_more_button}
            </button>
            <p className="blue" style={{ marginLeft: 12 }}>
              showing {entryPerPage} of {filteredBlogs.length}
            </p>
          </div>
        )}
      </section>
    </DefaultLayout>
  );
}

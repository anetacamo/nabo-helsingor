import React from "react";
import { useState, useMemo } from "react";
import { useRouter } from "next/router";
import { DefaultLayout } from "../../layouts/DefaultLayout/DefaultLayout";
import CrookedImage from "../../components/CrookedImage/CrookedImage";
import CardsSheets from "../../components/CardsSheets/CardsSheets";
import IconHolder from "../../components/IconHolder/IconHolder";
import Tags from "../../components/Tags/Tags";
import styles from "./card.module.scss";
import { faLocation } from "@fortawesome/free-solid-svg-icons";
import { slugify } from "../../utils/slugify";
import Blog from "../../types/card.type";
import { getColor } from "../../utils/getColor";
import useGoogleSheetsData from "../../hooks/useGoogleSheetsData";

export default function SinglePage() {
  const { blogs } = useGoogleSheetsData();

  const router = useRouter();
  const [blog, setBlog] = useState<Blog>();
  const relatedBlogs = blogs.filter(
    (b: Blog) => b.type.split(",")[0] === blog?.type.split(",")[0]
  );

  const getBlogs = useMemo(() => {
    setBlog(
      blogs.filter(
        (card: Blog) => slugify(card?.title) === router.query.slug
      )[0]
    );
  }, [blogs, router]);

  const descriptionWithLineBreaks = blog?.description
    .replace(/\\n/g, "\n")
    .replace(/\\+/g, "");

  const howtouseWithLineBreaks = blog?.howtouse
    .replace(/\\n/g, "\n")
    .replace(/\\+/g, "");

  return (
    <DefaultLayout title={blog?.title} description={blog?.description}>
      <CrookedImage image={`/images/${slugify(blog?.title)}.jpg`}>
        <div className={styles.text}>
          <p className={`${getColor(blog?.type)}`}>
            {blog?.supertag} {blog?.type}
          </p>
          <h1>{blog?.title}</h1>
          {blog?.address && (
            <IconHolder name={blog?.address} nolink icon={faLocation} />
          )}
          {blog?.link && (
            <IconHolder name="hjemmeside" link={blog?.link} small />
          )}
          {blog?.invisible && (
            <Tags tags={blog?.invisible} color={getColor(blog?.type)} />
          )}
        </div>
      </CrookedImage>

      {blog?.credit && <p className={styles.credit}>Foto: {blog?.credit}</p>}

      <section style={{ maxWidth: 600, margin: "auto" }}>
        <h4>Beskrivelse</h4>
        <p style={{ whiteSpace: "pre-wrap" }}>{descriptionWithLineBreaks}</p>
        <h4>Hvordan du kan benytte denne ressource</h4>
        <p style={{ whiteSpace: "pre-wrap" }}>{howtouseWithLineBreaks}</p>
      </section>

      <section className={`bg-black`}>
        <h2>other {blog?.type.split(",")[0]}</h2>
        {relatedBlogs && <CardsSheets members={relatedBlogs.slice(0, 5)} />}
      </section>
    </DefaultLayout>
  );
}

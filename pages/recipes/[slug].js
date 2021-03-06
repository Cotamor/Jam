import { createClient } from "contentful";
import Image from "next/image";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import Skelton from "../../components/Skelton";

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_KEY,
});

export const getStaticPaths = async () => {
  const res = await client.getEntries({ content_type: "recipe" });
  const paths = res.items.map((item) => {
    return {
      params: {
        slug: item.fields.slug,
      },
    };
  });
  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps = async (context) => {
  const slug = context.params.slug;

  const res = await client.getEntries({
    content_type: "recipe",
    "fields.slug": slug,
  });

  console.log(res);
  if (!res.items.length) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: { recipe: res.items[0] },
    revalidate: 1,
  };
};

export default function RecipeDetails({ recipe }) {
  if (!recipe) return <Skelton />;
  // console.log(recipe.fields);
  const { title, cookingTime, featuredImage, ingredients, method } =
    recipe.fields;
  return (
    <div>
      <div className="banner">
        <Image
          src={`https:${featuredImage.fields.file.url}`}
          width={featuredImage.fields.file.details.image.width}
          height={featuredImage.fields.file.details.image.height}
        />
        <h2>{title}</h2>
      </div>
      <div className="info">
        <p>Takes about {cookingTime} mins to cook.</p>
        <h3>Ingredients:</h3>
        {ingredients.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
      <div className="method">
        <h3>Method:</h3>
        <div>{documentToReactComponents(method)}</div>
      </div>

      <style jsx>{`
        h2,
        h3 {
          text-transform: uppercase;
        }
        .banner h2 {
          margin: 0;
          background: #fff;
          display: inline-block;
          padding: 20px;
          position: relative;
          top: -60px;
          left: -10px;
          transform: rotateZ(-1deg);
          box-shadow: 1px 3px 5px rgba(0, 0, 0, 0.1);
        }
        .info p {
          margin: 0;
        }
        .info span::after {
          content: ", ";
        }
        .info span:last-child::after {
          content: ".";
        }
        @media screen and (max-width: 900px) {
          .banner h2 {
            font-size: 1em;
            padding: 15px;
            top: -30px;
            left: -7px;
          }
          .method {
            font-size: 0.8em;
          }
        }
      `}</style>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { init } from "@contentful/app-sdk";
import { AppExtensionSDK } from "@contentful/app-sdk";
import { createRoot } from "react-dom/client";
import styles from "./styles/Home.module.css";

let query: string;
let locale: string;
let pageSize: number;
query = "bags";
locale = "nl-NL";
pageSize = 25;

const eva_app_token = process.env.REACT_APP_EVA_APP_TOKEN;

interface Product {
  product_id: string;
  display_value: string;
  display_price: number;
  primary_image?: { url: string };
  slug: string;
}

interface AppProps {
  sdk: AppExtensionSDK;
}

const App: React.FC<AppProps> = ({ sdk }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch(
          "https://api.euw.scotch.test.eva-online.cloud/message/SearchProducts",
          {
            method: "POST",
            headers: {
              accept: "application/json",
              "accept-language": locale,
              clientname: "eva-sdk-core",
              clientversion: "2.0.0",
              "content-type": "application/json",
              "eva-api-version": "711",
              "eva-app-contextid": "9ce9eef8-0be0-44f6-a97a-197adba5c8a2",
              "eva-app-payloadid": "8c042783fce66a2c2cb5c818f0809650",
              "eva-app-token": `${eva_app_token}`,
              "eva-requested-organizationunitid": "356",
              "eva-service-name": "Core:SearchProducts",
              "eva-user-agent": "scotch-and-soda/0.1.0",
              origin: "https://www-test.scotch-soda.eu",
              priority: "u=1, i",
              referer: "https://www-test.scotch-soda.eu/",
              "sec-ch-ua":
                '"Chromium";v="124", "Brave";v="124", "Not-A.Brand";v="99"',
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-platform": '"macOS"',
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "cross-site",
              "sec-gpc": "1",
              "user-agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            },
            body: JSON.stringify({
              Filters: {},
              Query: query,
              IncludedFields: [
                "currency_id",
                "display_price",
                "display_value",
                "product_id",
                "primary_image",
                "slug",
                "parent_id",
                "product_statuses",
                "parent_product_ids",
                "is_new",
                "is_new_label",
                "logical_level_hierarchy",
                "sizes",
              ],
              PageSize: pageSize,
              Options: {
                IncludePrefigureDiscounts: true,
              },
              SearchStrategyCode: "stocksearch",
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Response data:", data);

        if (data.Products) {
          // Accessing the correct array
          setProducts(data.Products);
        } else {
          throw new Error("Invalid response structure");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setError(`Failed to fetch products`);
      }
    }

    fetchProducts();
  }, []);

  return (
    <div className={styles.productContainer}>
      <h1>Products</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul className={styles.productList}>
        {products &&
          products.map((product) => (
            <li key={product.product_id}>
              <a href={`/product/${product.slug}`}>
                {/* Conditional rendering for the image */}
                {product.primary_image && (
                  <img
                    className={styles.productImage}
                    src={product.primary_image.url}
                    alt={product.display_value}
                  />
                )}
                <h2 className={styles.productTitle}>{product.display_value}</h2>
                <span className={styles.price}>€ {product.display_price}</span>
              </a>
            </li>
          ))}
      </ul>
    </div>
  );
};

init((sdk: AppExtensionSDK) => {
  const container = document.getElementById("root");
  if (container) {
    const root = createRoot(container);
    root.render(<App sdk={sdk} />);
  }
});

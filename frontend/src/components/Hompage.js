import React, { useEffect } from "react";
import MetaData from "./layout/MetaData";
import ProductItem from "./product/ProductItem";
import { useGetProductsQuery } from "../redux/api/productApi";
import Loader from "./layout/Loader";
import toast from "react-hot-toast";
import CustomPagination from "./layout/CustomPagination";
import { useSearchParams } from "react-router-dom";
import Filter from "./layout/Filter";

const Hompage = () => {
  // to make the Pages  to work from Backend
  let [searchParams] = useSearchParams();
  const page = searchParams.get("page") || 1;
   // To make search work from Backend
   const keyword = searchParams.get("keyword") || "";
   // to make Filter Work from Backend
   const min = searchParams.get("min") 
   const max = searchParams.get("max") 
   // to make category work from Backend
   const category = searchParams.get("category") 
    // to make rating work from Backend
    const ratings = searchParams.get("ratings") 

  const params = { page, keyword };

  min !==null && (params.min = min)
  max !==null && (params.max = max)
  category !==null && (params.category = category)
  ratings !==null && (params.ratings = ratings)

  const { data, isLoading, error, isError } = useGetProductsQuery(params);

  useEffect(() => {
    if (isError) {
      toast.error(error?.data?.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError]);

   // to implement column size
  const columnSize = keyword ? 4 : 3

  if (isLoading) return <Loader />;

  return (
    <>
      <MetaData title={"Buy Best Products Online"} />
      <div className="container">
      {/* To display FILTERS when you search */}
        <div className="row">
          {keyword && (
            <div className="col-12 col-md-3 mt-5">
              <Filter />
            </div>
          )}
          <div className={keyword ? "col-12 col-sm-6 col-md-9" : "col-12 col-sm-6 col-md-12"}>
            <h1 id="products_heading" className="text-secondary">
              {/* To show latest Products or number of search results  */}
              {keyword ? `${data?.products?.length} Products found with keyword: ${keyword}` : "Latest Products"}
            </h1>

            <section id="products" className="mt-0">
              <div className="row">
                {data?.products?.map((product) => (
                  // to implement column size
                  <ProductItem product={product} columnSize={columnSize} />
                ))}
              </div>
            </section>

            <CustomPagination
              resPerPage={data?.resPerPage}
              filteredProductCount={data?.filteredProductCount}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Hompage;

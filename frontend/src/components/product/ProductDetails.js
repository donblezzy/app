import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useGetProductDetailsQuery } from '../../redux/api/productApi'
import toast from 'react-hot-toast'
import Loader from '../layout/Loader'
import StarRatings from "react-star-ratings";
import { useDispatch, useSelector } from 'react-redux'
import { setCartItem } from '../../redux/features/cartSlice'
import MetaData from '../layout/MetaData'
import NewReview from '../reviews/NewReview'
import ListReviews from '../reviews/ListReviews'
import NotFound from '../layout/NotFound'


const ProductDetails = () => {
    const params = useParams()
    const dispatch = useDispatch()

    const [quantity, setQuantity] = useState(1)

    const { data, isLoading, error, isError }= useGetProductDetailsQuery(params.id)
    const product = data?.product

// to show Review
    const { isAuthenticated } = useSelector((state) => state.auth)


// to show the image in the product details
    const [activeImage, setActiveImage] = useState('')
    useEffect(() => {
      setActiveImage(product?.Images[0] ? product?.Images[0]?.url : '/images/default_product.png')
    }, [product])


// to show loading state 
    useEffect(() => {
      if (isError) {
          // eslint-disable-next-line react-hooks/exhaustive-deps
        toast.error(error?.data?.message)
      }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isError])

    const increaseQty = () => {
      const count = document.querySelector(".count")

      if (count.valueAsNumber >= product.stock) return
      const qty = count.valueAsNumber + 1
      setQuantity(qty) 
    }

    const decreaseQty = () => {
      const count = document.querySelector(".count")

      if (count.valueAsNumber <= 1) return
      const qty = count.valueAsNumber - 1
      setQuantity(qty) 
    }

    const setItemToCart = () => {
      const cartItem = {
        product: product?._id,
        name: product?.name,
        price: product?.price,
        image: product?.Images[0]?.url,
        stock: product?.stock,
        quantity
      }

      dispatch(setCartItem(cartItem))
      toast.success("Item added to cart")
    }

    if (isLoading) return <Loader />

    if (error && error?.status === 404) {
      return <NotFound />
    }


  return (
    <>
    <MetaData title={product?.name} />
    <div className="row d-flex justify-content-around">
    <div className="col-12 col-lg-5 img-fluid" id="product_image">
      <div className="p-3">
        <img
          className="d-block w-100"
          src={activeImage}
          alt={product?.name}
          width="340"
          height="390"
        />
      </div>

      {/* to show smallest image */}
      <div className="row justify-content-start mt-5">
        {product?.Images?.map((img) => (
           <div className="col-2 ms-4 mt-2">
           <button>
             <img
             // to show the border warning and to make onclick change the image
               className={`d-block border rounded p-3 cursor-pointer ${img.url === activeImage ? "border-warning" : ""}  `}
               height="100"
               width="100"
               src={img?.url}
               alt={img?.url}
               onClick={(e) => setActiveImage(img.url)}
             />
           </button>
         </div>

        ))}
       
      </div>
    </div>

    <div className="col-12 col-lg-5 mt-5">
      <h3>{product?.name}</h3>
      <p id="product_id">Product # {product?._id}</p>

      <hr />

      <div className="d-flex">
{/* to display the ratings */}
      <StarRatings
              rating={product.ratings}
              starRatedColor="#ffb829"
              numberOfStars={5}
              name="rating"
              starDimension="20px"
              starSpacing="1px"
            />
        <span id="no-of-reviews" className="pt-1 ps-2"> ({product?.numOfReviews} Reviews) </span>
      </div>
      <hr />

      <p id="product_price">${product?.price}</p>
      <div className="stockCounter d-inline">
        <span className="btn btn-danger minus" onClick={decreaseQty}>-</span>
        <input
          type="number"
          className="form-control count d-inline"
          value={quantity}
          readonly
        />
        <span className="btn btn-primary plus" onClick={increaseQty}>+</span>
      </div>
      <button
        type="button"
        id="cart_btn"
        className="btn btn-primary d-inline ms-4"
        disabled={product.stock <= 0}
        onClick={setItemToCart}
      >
        Add to Cart
      </button>

      <hr />

      <p>
        Status: <span id="stock_status" className={product?.stock > 0 ? "greenColor" : "redColor"}>{product?.stock > 0 ? "In Stock" : "Out of Stock"}</span>
      </p>

      <hr />

      <h4 className="mt-2">Description:</h4>
      <p>{product?.description}</p>
      <hr />
      <p id="product_seller mb-3">Sold by: <strong>{product?.seller}</strong></p>

         {isAuthenticated ? (<NewReview productId={product?._id} /> ) :  (
      <div className="alert alert-danger my-5" type="alert">
        Login to post your review.
      </div>
      )}
    </div>
  </div>
  {product?.reviews?.length > 0 && <ListReviews reviews={product?.reviews} />}
  </>
  )
}

export default ProductDetails

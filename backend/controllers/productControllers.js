import APIFilters from "../Utils/apiFilter.js";
import ErrorHandler from "../Utils/errorHandler.js";
import catchAsyncError from "../middlewares/catchAsyncError.js";
import Product from "../models/product.js";
import Order from "../models/order.js";
import {delete_file, upload_file} from "../Utils/cloudinary.js"

// get Product => /api/products
export const getProducts = async (req, res, next) => {
  const resPerPage = 4;
  const apiFilters = new APIFilters(Product, req.query).search().filters();

  let products = await apiFilters.query;
  let filteredProductCount = products.length;

  apiFilters.pagination(resPerPage);
  products = await apiFilters.query.clone();

  res.status(200).json({
    resPerPage,
    filteredProductCount,
    products,
  });
};

// Get Products- ADMIN => /api/admin/products
export const getAdminProducts = catchAsyncError(async (req, res, next) => {
  const products = await Product.find()

  res.status(200).json({
    products,
  });
});

// Create new Product => /api/admin/products
export const newProduct = catchAsyncError(async (req, res) => {
  req.body.user = req.user._id;
  const product = await Product.create(req.body);

  res.status(200).json({
    product,
  });
});

// Get a single Product details => /api/products/:id
export const getProductDetails = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req?.params?.id).populate("reviews.user");

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  res.status(200).json({
    product,
  });
});

  // Update Product details => /api/products/:id
  export const updateProduct = catchAsyncError(async (req, res) => {
    let product = await Product.findById(req?.params?.id);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    product = await Product.findByIdAndUpdate(req?.params?.id, req.body, {
      new: true,
    });

    res.status(200).json({
      product,
    });
  });

// Delete Product => /api/products/:id
export const deleteProduct = catchAsyncError(async (req, res) => {
  const product = await Product.findById(req?.params?.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  //Deleting Image Associated with Product
  for (let i = 0; i < product?.Images?.length; i++) {
    await delete_file(product?.Images[i].public_id)
  }

  await product.deleteOne();

  res.status(200).json({
    message: "Product Deleted",
  });
});

// CREATE/UPDATE Product REVIEW => /api/reviews
export const createProductReview = catchAsyncError(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req?.user?._id,
    rating: Number(rating),
    comment,
  };
  const product = await Product.findById(productId);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const isReviewed = product?.reviews?.find(
    (r) => r.user.toString() === req?.user?._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((review) => {
      if (review?.user?.toString() === req?.user?._id.toString()) {
        review.comment = comment;
        review.ratings = rating;
      }
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  product.ratings =
    product.reviews.reduce(
      (accumulator, item) => item.ratings + accumulator,
      0
    ) / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: "Product Review added Successfully",
  });
});

// GET Product REVIEW => /api/reviews
export const getProductReview = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.id).populate("reviews.user");

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    reviews: product.reviews,
  });
});

// DELETE Product REVIEW => /api/admin/reviews
export const deleteProductReview = catchAsyncError(async (req, res, next) => {
  let product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const reviews = product?.reviews?.filter(
    (review) => review._id.toString() !== req?.query?.id.toString()
  );

  const numOfReviews = reviews.length;

  const ratings =
    numOfReviews === 0
      ? 0
      : product.reviews.reduce(
          (accumulator, item) => item.ratings + accumulator,
          0
        ) / numOfReviews;

  product = await Product.findByIdAndUpdate(
    req.query.productId,
    { reviews, numOfReviews, ratings },
    { new: true }
  );
  // await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: "Product Review deleted Successfully",
    //OPTIONAL
    // product
  });
});


  // Can User Review => /api/can_review
  export const canUserReview = catchAsyncError(async (req, res) => {
    const orders = await Order.find({
      user: req.user._id,
      "orderItems.product": req.query.productId
    })

    if (orders.length === 0) {
      return res.status(200).json({ canReview: false});
    }

    res.status(200).json({
      canReview: true
    });
  });


   // Upload Product Images => /api/admin/products/:id/upload_images
   export const uploadProductImages = catchAsyncError(async (req, res) => {
    let product = await Product.findById(req?.params?.id);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    const uploader = async (images) => upload_file(images, "shopIT/Products")

    const urls = await Promise.all((req?.body?.images).map(uploader))

    product?.Images?.push(...urls)

    await product?.save()

    res.status(200).json({
      product,
    });
  });

   // delete Product Images => /api/admin/products/:id/delete_images
   export const deleteProductImage = catchAsyncError(async (req, res) => {
    let product = await Product.findById(req?.params?.id);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    const isDeleted = await delete_file(req.body.imgId)

    if (isDeleted) {
      product.Images = product?.Images?.filter(
        (img) => img.public_id !== req.body.imgId
      )
      await product?.save()
    }

    res.status(200).json({
      product,
    });
  });
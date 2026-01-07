import React from "react";
import MetaData from "../layout/MetaData";
import { Link } from "react-router-dom";

const Checkout = ({ shipping, confirmOrder, payment }) => {
  return (
    <>
      <MetaData title={"Checkout"} />
      <div className="checkout-progress d-flex justify-content-center  mt-5 row">
      { shipping ? (
        //   Shipping (Active)
          <Link
          to="/shipping"
          className="float-right mt-2 mt-md-0 col-12 col-md-3 col-lg-2"
        >
          <div className="triangle2-active"></div>
          <div className="step active-step">Shipping</div>
          <div className="triangle-active"></div>
        </Link>
      ) : (
         // Shipping (Inactive)
         <Link
         to="#!"
         className="float-right mt-2 mt-md-0 col-12 col-md-3 col-lg-2"
         disabled
       >
         <div className="triangle2-incomplete"></div>
         <div className="step incomplete">Shipping</div>
         <div className="triangle-incomplete"></div>
       </Link>
      )}

       {confirmOrder ? (
        // Confirm Order (Active)
        <Link
          to="/confirm_order"
          className="float-right mt-2 mt-md-0 col-12 col-md-4 col-lg-3"
        >
          <div className="triangle2-active"></div>
          <div className="step active-step">Confirm Order</div>
          <div className="triangle-active"></div>
        </Link>

       ) : (
          // Confirm Order (Inactive)
          <Link
          to="#!"
          className="float-right mt-2 mt-md-0 col-12 col-md-4 col-lg-3"
          disabled
        >
          <div className="triangle2-incomplete"></div>
          <div className="step incomplete">Confirm Order</div>
          <div className="triangle-incomplete"></div>
        </Link>
       )}

       {payment ? (
        // Payment (Active)
        <Link
          to="/payment_method"
          className="float-right mt-2 mt-md-0 col-12 col-md-3 col-lg-2"
        >
          <div className="triangle2-active"></div>
          <div className="step active-step">Payment</div>
          <div className="triangle-active"></div>
        </Link>
       ) : (
          // Payment (Inactive)
          <Link
          to="#!"
          className="float-right mt-2 mt-md-0 col-12 col-md-3 col-lg-2"
          disabled
        >
          <div className="triangle2-incomplete"></div>
          <div className="step incomplete">Payment</div>
          <div className="triangle-incomplete"></div>
        </Link>
        )} 
      
      </div>
    </>
  );
};

export default Checkout;

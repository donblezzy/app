import React, { useEffect } from 'react'
import  Search from "./Search"
import { useGetMeQuery } from '../../redux/api/userApi'
import { useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { useLazyLogoutQuery } from '../../redux/api/authApi'

const Header = () => {

   const { isLoading } = useGetMeQuery()

   const [logout, {isSuccess}] = useLazyLogoutQuery()

   useEffect(() => {
    if (isSuccess)
      // eslint-disable-next-line
      navigate(0)
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [isSuccess])

   const { user } = useSelector((state) => state.auth)
   const { cartItems } = useSelector((state) => state.cart)

   const logoutHandler = () => {
    logout()
   }

   const navigate = useNavigate()

  return (
    <nav className="navbar row">
      <div className="col-12 col-md-3 ps-5">
        <div className="navbar-brand">
          <a href="/">
            <img src="/images/shopit_logo.png" alt="ShopIT Logo" />
          </a>
        </div>
      </div>
      <div className="col-12 col-md-6 mt-2 mt-md-0">
        <Search />
      </div>
      <div className="col-12 col-md-3 mt-4 mt-md-0 text-center">
        <a href="/cart" style={{textDecoration: "none"}}>
          <span id="cart" className="ms-1"> Cart </span>
          <span className="ms-1" id="cart_count">{cartItems?.length}</span>
        </a>

        { user ? (
          <div className="ms-4 dropdown">
          <button
            className="btn dropdown-toggle text-white"
            type="button"
            id="dropDownMenuButton"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <figure className="avatar avatar-nav">
              <img
                src={user?.avatar ? user?.avatar?.url : "/images/default_avatar.jpg"}
                alt="User Avatar"
                className="rounded-circle"
              />
            </figure>
            <span>{user?.name}</span>
          </button>
          <div className="dropdown-menu w-100" aria-labelledby="dropDownMenuButton">
            {user?.role === 'admin' && (
              <Link to="/admin/dashboard" className="dropdown-item"> Dashboard </Link>
            )}
            <Link to="/me/orders" className="dropdown-item"> Orders </Link>

            <Link to="/me/profile" className="dropdown-item"> Profile </Link>

            <Link to="/" className="dropdown-item text-danger" onClick={logoutHandler}> Logout </Link>
          </div>
        </div>
        ) : (
          !isLoading &&  (
            <Link to="/login" className="btn btn-warning btn-sm ms-4" id="login_btn"> Login </Link>
          )
        )}
        
      </div>
    </nav>
  )
}

export default Header

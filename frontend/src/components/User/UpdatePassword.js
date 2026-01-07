import React, { useState, useEffect } from 'react'
import { useUpdatePasswordMutation } from '../../redux/api/userApi';
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import UserLayout from "../layout/UserLayout"
import MetaData from '../layout/MetaData';

const UpdatePassword = () => {

  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")

  const navigate = useNavigate();
  const [UpdatePassword, { isLoading, error, isSuccess }] = useUpdatePasswordMutation();

  useEffect(() => {
    if (error) {
        toast.error(error?.data?.message);
      }
      if (isSuccess) {
        toast.success("Password Updated Successfully");
        navigate("/me/profile")
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, isSuccess])

  const submitHandler = (e) => {
    e.preventDefault();

    const userData = {
      oldPassword,
      newPassword,
    };

    UpdatePassword(userData);
  };

  return (
    <UserLayout>
      <MetaData title={"Update Password"} />
    <div className="row wrapper">
      <div className="col-10 col-lg-8">
        <form className="shadow rounded bg-body" onSubmit={submitHandler}>
          <h2 className="mb-4">Update Password</h2>
          <div className="mb-3">
            <label htmlFor="old_password_field" className="form-label">
              Old Password
            </label>
            <input
              type="password"
              id="old_password_field"
              className="form-control"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="new_password_field" className="form-label">
              New Password
            </label>
            <input
              type="password"
              id="new_password_field"
              className="form-control"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn update-btn w-100" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
    </UserLayout>
  )
}

export default UpdatePassword

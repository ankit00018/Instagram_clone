import React, { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import axios from "axios";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react"
import { useDispatch } from "react-redux";
import { setAuthUser } from "../redux/authSlice";

const Login = () => {
  const [input, setInput] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const signupHandler = async (e) => {
    e.preventDefault();
    console.log(input);

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:8000/api/v1/users/login",
        input,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, // ✅ This ensures cookies are included
        }
      );

      console.log("Login Response:", res);
      console.log("Response Headers:", res.headers);
      console.log("Set-Cookie Header:", res.headers["set-cookie"]);

      if (res.data.success) {
        // localStorage.setItem("token", res.data.accessToken); // Save token
        dispatch(setAuthUser(res.data.user))
        console.log("User stored in Redux:", res.data.user);
        navigate("/")
        toast.success(res.data.message);
        setInput({ username: "", email: "", password: "" });
      }else{
        toast.error(res.data.message || "Login failed");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center w-screen h-screen justify-center">
      <form
        onSubmit={signupHandler}
        className="shadow-lg flex flex-col gap-5 p-8"
      >
        <div className="my-4">
          <h1 className="text-center font-bold text-2xl">LOGO</h1>
          <p className="text-sm text-center">
            Login for free to access Homebook
          </p>
        </div>
        <div>
          <Label className="py-2">Username</Label>
          <Input
            type="text"
            name="username"
            value={input.username}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent"
          />
        </div>

        <div>
          <Label className="py-2">Password</Label>
          <Input
            type="password"
            name="password"
            value={input.password}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent"
          />
        </div>
        {
          loading ? (
            <Button>
              <Loader2  className="mr-2 w-4 h-4 animate-spin"/> Logging in 
            </Button>
          ) : ( <Button type="submit" disabled={loading}>
            Login
           </Button>)
        }
       
        <span className="text-center">Does not have an account? <Link to="/signup" className="text-blue-700">Signup</Link></span>

      </form>
    </div>
  );
};

export default Login;
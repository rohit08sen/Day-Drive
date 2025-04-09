import React from "react";

function Login() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-100">
      <div className="w-5xl  max-w-md p-6 bg-white rounded-4xl shadow-md transform-3d">
        <form action="/submit" className="space-y-4">
          <h2 className="text-2xl font-semibold text-center">User Login</h2>
          <input
            type="text"
            placeholder="Enter Username"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Enter Password"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            Login
          </button>
          <p className="text-center">
            Don't have an account?{" "}
            <a href="register" className="text-blue-500 hover:underline">
              Register
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;

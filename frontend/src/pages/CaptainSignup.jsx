import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const CaptainSignup = () => {

   const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstname, setFirstName] = useState("");
    const [lastname, setLastName] = useState("");
  
    const [userData, setUserData] = useState({});
  
    const submitHandler = (e) => {
      e.preventDefault();
  
      const data = {
        fullname: {
          firstname: firstname,
          lastname: lastname
        },
        email: email,
        password: password
      };
  
      setUserData(data);
  
      setEmail("");
      setFirstName("");
      setLastName("");
      setPassword("");
    };

  return (
    <div className="py-5 px-5 h-screen flex flex-col justify-between">

      <div>

         <img className="w-20 mb-2" src="https://www.svgrepo.com/show/505031/uber-driver.svg" alt="Uber" />

        <form onSubmit={submitHandler}>

          <h3 className="text-lg font-medium mb-2">
            What's your name
          </h3>

          <div className="flex gap-4 mb-6">

            <input
              className="bg-[#eeeeee] w-1/2 rounded px-4 py-2 border-0 text-base"
              required
              type="text"
              placeholder="First name"
              value={firstname}
              onChange={(e) => setFirstName(e.target.value)}
            />

            <input
              className="bg-[#eeeeee] w-1/2 rounded px-4 py-2 border-0 text-base"
              required
              type="text"
              placeholder="Last name"
              value={lastname}
              onChange={(e) => setLastName(e.target.value)}
            />

          </div>

          <h3 className="text-lg font-medium mb-2">
            What's your Email
          </h3>

          <input
            className="bg-[#eeeeee] mb-6 rounded px-4 py-2 border-0 w-full text-base"
            required
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <h3 className="text-lg font-medium mb-2">
            Enter Password
          </h3>

          <input
            className="bg-[#eeeeee] mb-6 rounded px-4 py-2 border-0 w-full text-base"
            type="password"
            required
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="bg-[#111] text-white font-semibold mb-3 rounded px-4 py-2 w-full text-lg"
          >
            Create Account
          </button>

        </form>

        <p className="text-center">
          Already have an account?{" "}
          <Link className="text-blue-600" to="/captain-login">
            Login here
          </Link>
        </p>

      </div>

      <div>

       <p className='text-[10px] mt-6 leading-tight'>This site is protected by reCAPTCHA and the <span className='underline'>Google Privacy
          Policy</span> and <span className='underline'>Terms of Service apply</span>.</p>

      </div>

    </div>
  )
}

export default CaptainSignup
import React, { useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import UserSignup from './UserSignup'
import { UserDataContext } from '../context/userContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'


const UserLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userData, setUserData] = useState({})

  const {user, setuser}  = useContext(UserDataContext)
  const  navigate = useNavigate();

  const submitHandler = async (e) =>{
    e.preventDefault();
    const userData={
      email: email,
      password: password
    }
    const response =await axios.post(`${import.meta.env.VITE_BASE_URL}/users/login`,userData)

    if(response.status === 200){
      const data = response.data
      setuser(data.user)
      localStorage.setItem('token',data.token)
      navigate('/home')
    }

    setEmail('')
    setPassword('')
  }

  return (
    <div className='p-7 h-screen flex-col justify-between'>
      <div>
      <img className="w-16 mb-10" src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="" />
        <form onSubmit={(e) =>{
          submitHandler(e)
        }}>

        <h3 className='text-lg font-medium mb-2'>What's your Email</h3>
        <input
         className='bg-[#eeeeee] mb-7 rounded px-4 py-2 border w-full text-lg placeholder:text-base'
        value={email}
        onChange={(e) =>{
          setEmail(e.target.value)
        }}
        type="email" 
        required 
        placeholder='email@example.com ' 
        />
        
        <h3 className='text-lg font-medium mb-2'>Enter Password</h3>
        <input 
        className='bg-[#eeeeee] mb-7 rounded px-4 py-2 border w-full text-lg placeholder:text-base' 
        type="password" 
         value={password}
        onChange={(e) =>{
          setPassword(e.target.value)
        }}
        required 
        placeholder='password' />
        
        <button className='bg-[#111] text-white font-semibold mb-3 rounded px-4 py-2 w-full text-lg placeholder:text-base'>Login</button>
      </form>
       <p className='text-center'>New here? <Link className='text-blue-600' to='/signup'>Create new Account</Link></p>
      </div>
      <div>
        <Link to={'/captain-login'} className='flex items-center justify-center bg-[#10b461] text-white font-semibold mb-5 rounded px-4 py-2 w-full text-lg placeholder:text-base'>Sign In as Captain</Link>
      </div>
    </div>
  )
}

export default UserLogin
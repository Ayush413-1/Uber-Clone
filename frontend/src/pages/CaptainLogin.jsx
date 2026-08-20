import React from 'react'
import  { useState } from 'react'
import { Link,useNavigate } from 'react-router-dom'
import axios from 'axios'
import { CaptainDataContext } from '../context/CaptainContext'

const CaptainLogin = () => {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const {captain, setCaptain } = React.useContext(CaptainDataContext)
  const navigate =useNavigate()
  
  
    const submitHandler = async (e) =>{
      e.preventDefault();

      const captain = {
        email:email,
        password
      }

      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/captains/login`,captain)

      if(response.status === 200){
        const data =response.data
        
        localStorage.setItem('token',data.token)
        navigate('/captain-home')

      }

      setEmail('')
      setPassword('')
    }

  return (
    <div className='p-7 h-screen flex-col justify-between'>
      <div>
      <img className="w-20 mb-2" src="https://www.svgrepo.com/show/505031/uber-driver.svg" alt="" />
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
        placeholder='password' 
        />
        
        <button className='bg-[#111] text-white font-semibold mb-3 rounded px-4 py-2 w-full text-lg placeholder:text-base'>Login</button>
      </form>
       <p className='text-center mb-10'>Join a fleet? <Link className='text-blue-600' to='/captain-signup'>Register as a Captain</Link></p>
      </div>
      <div>
        <Link to={'/login'} className='flex items-center justify-center bg-[#d5622d] text-white font-semibold mb-5 rounded-lg px-4 py-2 w-full text-lg placeholder:text-base'>Sign In as User</Link>
      </div>
    </div>
  )
}

export default CaptainLogin
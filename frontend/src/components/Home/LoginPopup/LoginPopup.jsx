import React, {useContext, useState} from 'react'
import { AppContext } from '@/context/AppContext'
import { X }  from "lucide-react"
import axios from 'axios'
import { toast } from 'react-toastify'

const LoginPopup = ({setShowLogin}) => {

  const {url, setToken} = useContext(AppContext)

  const [currState, setCurrState] = useState("Sign Up")
  const [data, setData] = useState({
    name:"",
    username:"",
    email:"",
    password:""
  })

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(data=>({...data,[name]:value}))
  }

  const onLogin = async (event) => {
    event.preventDefault()
    let newUrl = url;
    if (currState==="Login") {
      newUrl += "/api/auth/login"
    }
    else {
      newUrl += "/api/auth/register"
    }

    try{
      const response = await axios.post(newUrl, data);
      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);
        setShowLogin(false)
        toast.success("Logged in successfully")
      }
    } catch (e) {
      console.error("Error during login:", e);
    if (e.response && e.response.data && e.response.data.message) {
      toast.error(e.response.data.message);
    } else {
      toast.error("An error occurred during login. Please try again.");
    }
    }
  }

  return (
    <div className='absolute z-[1000] w-full h-full bg-[#00000090] grid'>
      <form onSubmit={onLogin} className='place-self-center w-[max(23vw,330px)] text-[#808080] bg-white flex flex-col gap-[25px] px-[30px] py-[25px] rounded-[8px] text-sm animate-fadeIn'>
        <div className='flex justify-between items-center text-black'>
          <h2>{currState}</h2>
          <X onClick={()=>setShowLogin(false)} className='w-4 cursor-pointer'/>
        </div>
        <div className='flex flex-col gap-5'>
          {currState==="Login"? (
          <></> ): (
          <>
            <input className='outline-none border border-[#c9c9c9] p-[10px] rounded-sm' name='name' onChange={onChangeHandler} value={data.name} type='text' placeholder='Full Name' required />
            <input className='outline-none border border-[#c9c9c9] p-[10px] rounded-sm' name='username' onChange={onChangeHandler} value={data.username} type='text' placeholder='Username' required />
          </>
          )}
          <input className='outline-none border border-[#c9c9c9] p-[10px] rounded-sm' name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Email' required/>
          <input className='outline-none border border-[#c9c9c9] p-[10px] rounded-sm' name='password' onChange={onChangeHandler} value={data.password} type="password" placeholder='Password' required/>
        </div>
        <button className='border border-none p-[10px] rounded-sm text-white bg-blue-500 text-[15px] cursor-pointer' type='submit'>{currState==="Sign Up"?"Create Account":"Login"}</button>
        <div className='flex items-center gap-2 mt-[-15px]'>
          <input className='mt-[5px]' type="checkbox" required/>
          <p>By continuing, I agree to the Terms of Use & Privacy Policy.</p>
        </div>
        {currState==="Login"
        ?<p>Create a new account? <span className='text-blue-500 font-medium cursor-pointer underline' onClick={()=>setCurrState("Sign Up")}>Click Here</span></p>
      :<p>Already have an account? <span className='text-blue-500 font-medium cursor-pointer underline' onClick={()=>setCurrState("Login")}>Login Here</span></p>
      }
      </form>
    </div>
  )
}

export default LoginPopup
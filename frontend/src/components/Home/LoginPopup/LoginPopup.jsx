import React, {useContext, useState} from 'react'
import { AppContext } from '@/context/AppContext'
import { X }  from "lucide-react"
import axios from 'axios'
import { toast } from 'react-toastify'

const LoginPopup = ({setShowLogin}) => {
  const {url, setToken} = useContext(AppContext)
  const [currState, setCurrState] = useState("Sign Up")
  const [verificationMode, setVerificationMode] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [data, setData] = useState({
    name:"",
    username:"",
    email:"",
    password:"",
    role: ""
  })

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(data=>({...data,[name]:value}))
  }

  const verifyEmail = async (e) => {
    try {
      const response = await axios.get(`${url}/api/auth/verify/${verificationCode}/${data.email}`)
      if (response.data.success) {
        toast.success("Email verified successfully", {
          position: 'top-center',
          autoClose: 2000,
          hideProgressBar: true,
        });
        
        // console.log(`token, ${response.data.token}`);
        // setToken(response.data.token);
        // localStorage.setItem("token", response.data.token);
        setShowLogin(false);
        toast.success("Logged in successfully", {
          position: 'top-center',
          autoClose: 2000,
          hideProgressBar: true,
        });
      }
    } catch (e) {
      console.error("Error response:", e.response?.data);
      toast.error(e.response?.data?.message || "Verification failed", {
        position: 'top-center',
        autoClose: 2000,
        hideProgressBar: true,
      });
    }
  }

  // In LoginPopup.jsx
  const onLogin = async (event) => {
    event.preventDefault()
    let newUrl = url;
    if (currState === "Login") {
        newUrl += "/api/auth/login"
    } else {
        newUrl += "/api/auth/register"
    }

    try {
        const response = await axios.post(newUrl, data);
        if (response.data.success) {
          const token = response.data.token;
          if (currState === "Sign Up") {
            setVerificationMode(true);
            setToken(token);
            localStorage.setItem("token", token);
            toast.success("Account created successfully", {
              position: 'top-center',
              autoClose: 2000,
              hideProgressBar: true,
            });
          } else {
            setToken(response.data.token);
            // Also set the user immediately
            localStorage.setItem("token", response.data.token);
            // Optionally store user data too
            setShowLogin(false);
            toast.success("Logged in successfully", {
              position: 'top-center',
              autoClose: 2000,
              hideProgressBar: true,
            });
          }
        } else {
          toast.error("Authentication failed", {
            position: 'top-center',
            autoClose: 2000,
            hideProgressBar: true,
          });
        }
    } catch (e) {
        console.error("Error response:", e.response?.data);
        toast.error(e.response?.data?.message || "Login failed", {
          position: 'top-center',
          autoClose: 2000,
          hideProgressBar: true,
        });
    }
  }

  if (verificationMode) {
    return (
      <div className='absolute z-[1000] w-full h-full bg-[#00000090] grid'>
        <div className='place-self-center w-[max(23vw,330px)] text-[#808080] bg-white flex flex-col gap-[25px] px-[30px] py-[25px] rounded-[8px] text-sm animate-fadeIn'>
          <div className='flex justify-between items-center text-black'>
            <h2>Email Verification</h2>
            <X onClick={() => setShowLogin(false)} className='w-4 cursor-pointer'/>
          </div>
          <p>Please Enter the verification code sent to your email.</p>
          <input 
            className='outline-none border border-[#c9c9c9] p-[10px] rounded-sm'
            text='text'
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder='Enter Verification Code'
          />
          <button
            className='border border-none p-[10px] rounded-sm text-white bg-blue-500 text-[15px] cursor-pointer'
            onClick={verifyEmail}
          >
            Verify Email
          </button>
        </div>
      </div>
    )
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
          {currState==="Login"? (
          <></> ): (
            <select name='role' className='outline-none border border-[#c9c9c9] p-[10px] rounded-sm' required onChange={onChangeHandler} value={data.role}>
              <option value="" disabled>Account Type</option>
              <option value="user">Public User</option>
              <option value="researcher">Researcher</option>
            </select>
          )}

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
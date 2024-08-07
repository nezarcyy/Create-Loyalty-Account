import React, { useState, useRef, useEffect } from 'react';
import { getAccessToken, getHmac, createLoyaltyAccount, checkOTP } from '../services/API';
import { v4 as uuidv4 } from 'uuid';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    firstName: '',
    lastName: '',
    email: '',
  });
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpInputs = useRef([]);
  const [token, setToken] = useState(null);
  const [errorToken, setErrorToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(false);
  const [isValidatingOtp, setIsValidatingOtp] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  useEffect(() => {
    async function fetchToken() {
      console.log("Fetching token");
      try {
        const newToken = await getAccessToken();
        if (newToken.status === 200) {
          setToken(newToken.data.access_token);
        } else {
          setToken(null);
        }
      } catch (error) {
        setErrorToken("Can't get access token");
        console.error(error);
      }
    }
    fetchToken();
  }, [refreshToken]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const showLoader = (setLoaderState, duration) => {
    setLoaderState(true);
    return new Promise(resolve => setTimeout(() => {
      setLoaderState(false);
      resolve();
    }, duration));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRefreshToken(!refreshToken);
    await showLoader(setIsSubmittingForm, 3000); // Show loader for 2 seconds

    try {
      const data = {
        timestamp: new Date().toISOString().split('.')[0] + 'Z',
        deviceId: "JJ9XkGXobk7CUxdY",
        requestId: uuidv4()
      };
      const response = await getHmac(token, data);

      if (response.status === 200) {
        try {
          const responseActor = await createLoyaltyAccount(
            token,
            data.requestId,
            data.deviceId,
            data.timestamp,
            response.data.hmacSignature,
            formData.phoneNumber,
            formData.firstName,
            formData.lastName,
            formData.email
          );
          if (responseActor.status === 201 && responseActor.data[0].isActionSuccessful) {
            setShowOtpPopup(true);
          } else if (responseActor.status === 401) {
            setRefreshToken(!refreshToken);
          }
        } catch (error) {
          console.error("Create loyalty account error ", error);
        }
      } else if (response.status === 401) {
        setRefreshToken(!refreshToken);
      }
    } catch (error) {
      setErrorToken("Can't get HMAC");
      console.error(error);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp.every(digit => digit !== '')) {
      return; 
    }
    await showLoader(setIsValidatingOtp, 3000);

    try {
      const data = {
        timestamp: new Date().toISOString().split('.')[0] + 'Z',
        deviceId: "JJ9XkGXobk7CUxdY",
        requestId: uuidv4()
      };
      const response = await getHmac(token, data);

      if (response.status === 200) {
        try {
          const responseOTP = await checkOTP(
            token,
            formData.phoneNumber,
            otp.join('')
          );

          if (responseOTP.data.isValid) {
            setFormData({
              phoneNumber: '',
              firstName: '',
              lastName: '',
              email: '',
            });
            setOtp(['', '', '', '', '', '']);
            setRefreshToken(!refreshToken);
            setShowOtpPopup(false);
          } else if (responseOTP.status === 401) {
            setRefreshToken(!refreshToken);
          }
        } catch (error) {
          console.error("Check OTP error ", error);
        }
      } else if (response.status === 401) {
        setRefreshToken(!refreshToken);
      }
    } catch (error) {
      setErrorToken("Can't get HMAC");
      console.error(error);
    }
  };

  const handleOtpChange = (index, value) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value !== '' && index < 5) {
      otpInputs.current[index + 1].focus();
    }

    if (newOtp.every(digit => digit !== '')) {
      handleOtpSubmit({ preventDefault: () => {} });
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpInputs.current[index - 1].focus();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-[#37A7DE] text-gray-50 hover:bg-[#2b7aa1] h-10 py-2 w-full"
          >
            Confirm
          </button>
        </form>
      </div>

      {showOtpPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="otp" className="text-sm font-medium text-gray-700">Enter OTP</label>
                <div className="flex items-center justify-between">
                  <div className="flex space-x-6">
                    {otp.slice(0, 3).map((digit, index) => (
                      <input
                        key={index}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        ref={(el) => (otpInputs.current[index] = el)}
                        className="w-10 h-12 text-center text-xl border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                      />
                    ))}
                  </div>
                  <span className="text-2xl text-gray-400">-</span>
                  <div className="flex space-x-6">
                    {otp.slice(3).map((digit, index) => (
                      <input
                        key={index + 3}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(index + 3, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index + 3, e)}
                        ref={(el) => (otpInputs.current[index + 3] = el)}
                        className="w-10 h-12 text-center text-xl border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                      />
                    ))}
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-[#37A7DE] text-gray-50 hover:bg-[#2b7aa1] h-10 py-2 w-full"
              >
                Validate
              </button>
            </form>
          </div>
        </div>
      )}
      {(isSubmittingForm || isValidatingOtp) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center backdrop-filter backdrop-blur-sm z-50">
          <div role="status">
            <svg aria-hidden="true" className="w-16 h-16 text-gray-200 animate-spin dark:text-gray-600 fill-[#31A4DB]" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationForm;
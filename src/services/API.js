import axios from 'axios';
import qs from 'qs';

export const getAccessToken = async () => {
  const data = qs.stringify({
    'client_id': 'backend-service',
    'client_secret': 'secret',
    'username': 'admin',
    'password': 'ysJHZ*J810/5',
    'grant_type': 'password'
  });

  const config = {
    method: 'post',
    url: 'https://login.staging.alyf.ai/realms/paymob/protocol/openid-connect/token',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: data
  };

  try {
    const response = await axios(config);
    return response
  } catch (err) {
    console.log(err);

  }
};

export const getHmac = async (TOKEN, data) => {
  const config = {
    method: 'post',
    url: 'https://bank.staging.alyf.ai/api/v1/merchant/hmac',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`,
    },
    data: data
  };

  try {
    const response = await axios(config);
    return response
  } catch (err) {
    console.log(err);

  }
};

export const createLoyaltyAccount = async (
  TOKEN,
  requestId,
  deviceId,
  timeStamp,
  hmac,
  phoneNumber,
  firstName,
  lastName,
  eamil) => {
  const data = {
    context: {
      orgCode: "ACME",
      creationChannel: "OTHER",
      country: "morroco",
      brandCode: "ACME",
      dptName: "ACME HQ",
      tillNumber: "123",
      operatorPhoneNumber: "212700443770"
    },
    actors: [
      {
        firstname: firstName,
        lastname: lastName,
        username: phoneNumber,
        email: eamil,
        phoneNumber:phoneNumber,
        phoneOperator: "IAM"
      }
    ]
  };

  const config = {
    method: 'post',
    url: 'https://actor.staging.alyf.ai/api/v1/actors/loyalty',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`,
      'x-request-Id': requestId,
      'x-device-Id': deviceId,
      'x-timestamp': timeStamp,
      'x-hmac-signature': hmac

    },
    data: data
  };

  try {
    const response = await axios(config);
    return response
  } catch (err) {
    console.log(err);

  }
};

export const checkOTP = async (TOKEN, phoneNumber , otp) => {
  const config = {
    method: 'put',
    url: 'https://actor.staging.alyf.ai/api/v1/actors/otpValidation/ACTOR_ACTIVATION_OTP/'+phoneNumber+'/'+otp,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`,
    }
  };

  try {
    const response = await axios(config);
    return response
  } catch (err) {
    console.log(err);

  }
};
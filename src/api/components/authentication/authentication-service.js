const authenticationRepository = require('./authentication-repository');
const { generateToken } = require('../../../utils/session-token');
const { passwordMatched } = require('../../../utils/password');

//timeout 30 menit maksimal try 5.
let triesLimit = 5,timeout = 30 * 60 * 1000
const error = {};
/**
 * Check username and password for login.
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {object} An object containing, among others, the JWT token if the email and password are matched. Otherwise returns null.
 */
 
async function checkLoginCredentials(email, password) {
  if(error[email] && error[email].try >= triesLimit ){
    const waktuPercobaan = new Date().getTime();
  if(waktuPercobaan - error[email].timestamp < timeout){
    const sisaTimeout = Math.ceil(timeout / 60000) //60000 milisecond 
    throw new Error(`Sudah mencoba terlalu banyak (5 kali). Please try again in ${sisaTimeout} minutes.`);
  }else{
    delete error[email]; //saya tidak tau cara apa yang bisa digunakan untuk mereset waktu jadi saya pakai delete aja
  }
                                                     }
  const user = await authenticationRepository.getUserByEmail(email);
  // We define default user password here as '<RANDOM_PASSWORD_FILTER>'
  // to handle the case when the user login is invalid. We still want to
  // check the password anyway, so that it prevents the attacker in
  // guessing login credentials by looking at the processing time.
  const userPassword = user ? user.password : '<RANDOM_PASSWORD_FILLER>';
  const passwordChecked = await passwordMatched(password, userPassword);

  // Because we always check the password (see above comment), we define the
  // login attempt as successful when the `user` is found (by email) and
  // the password matches.
  if (user && passwordChecked) {
    return {
      email: user.email,
      name: user.name,
      user_id: user.id,
      token: generateToken(user.email, user.id),
    };
  }
  if(!error[email]){ //jika tidak error maka bisa melakukan percobaan hingga 5 kali (<=5)
    error[email]={try:0,timestamp:new Date().getTime() };
  }
    error[email].try++
  return null;
}

module.exports = {
  checkLoginCredentials,
};

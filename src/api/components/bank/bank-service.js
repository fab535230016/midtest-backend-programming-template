const banksRepository = require('./bank-repository');
const { hashPassword, passwordMatched } = require('../../../utils/password');

/**
 * Get list of banks
 * @returns {Array}
 */
async function getBanks(page_number, page_size) {
  let banks = await banksRepository.getBanks(page_number, page_size); //error jadi saya ganti dari const ke let
  const results = [];
  
  for (let i = 0; i < banks.length; i += 1) {
    const bank = banks[i];
    results.push({
      id: bank.id,
      name: bank.name,
      email: bank.email,
    });
  }

  return results;
}

/**
 * Get bank detail
 * @param {string} id - Bank ID
 * @returns {Object}
 */
async function getBank(id) {
  const bank = await banksRepository.getBank(id);

  // bank not found
  if (!bank) {
    return null;
  }

  return {
    id: bank.id,
    name: bank.name,
    email: bank.email,
  };
}

/**
 * Create new bank
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {boolean}
 */
async function createBank(name, email, password,alamatTempatLahir,informasiKeuangan,pekerjaan,penghasilan) {
  // Hash password
  const hashedPassword = await hashPassword(password);

  try {
    await banksRepository.createBank(name, email, hashedPassword,alamatTempatLahir,informasiKeuangan,pekerjaan,penghasilan);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update existing bank
 * @param {string} id - Bank ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {boolean}
 */
async function updateBank(id, name, email,password,alamatTempatLahir,informasiKeuangan,pekerjaan,penghasilan) {
  const bank = await banksRepository.getBank(id);

  // Bank not found
  if (!bank) {
    return null;
  }

  try {
    await banksRepository.updateBank(id, name, email,password,alamatTempatLahir,informasiKeuangan,pekerjaan,penghasilan);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete bank
 * @param {string} id - Bank ID
 * @returns {boolean}
 */
async function deleteBank(id) {
  const bank = await banksRepository.getBank(id);

  // Bank not found
  if (!bank) {
    return null;
  }

  try {
    await banksRepository.deleteBank(id);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Check whether the email is registered
 * @param {string} email - Email
 * @returns {boolean}
 */
async function emailIsRegistered(email) {
  const bank = await banksRepository.getBankByEmail(email);

  if (bank) {
    return true;
  }

  return false;
}

/**
 * Check whether the password is correct
 * @param {string} bankId - Bank ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function checkPassword(bankId, password) {
  const bank = await banksRepository.getBank(bankId);
  return passwordMatched(password, bank.password);
}

/**
 * Change bank password
 * @param {string} bankId - Bank ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function changePassword(bankId, password) {
  const bank = await banksRepository.getBank(bankId);

  // Check if bank not found
  if (!bank) {
    return null;
  }

  const hashedPassword = await hashPassword(password);

  const changeSuccess = await banksRepository.changePassword(
    bankId,
    hashedPassword
  );

  if (!changeSuccess) {
    return null;
  }

  return true;
}

module.exports = {
  getBanks,
  getBank,
  createBank,
  updateBank,
  deleteBank,
  emailIsRegistered,
  checkPassword,
  changePassword,
};
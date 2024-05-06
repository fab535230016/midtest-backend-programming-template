const { Bank } = require('../../../models');

/**
 * Get a list of users
 * @returns {Promise}
 */

async function getBanks(page_number,page_size) {
  return Bank.find({page_number,page_size});
}


/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function getBank(id) {
  return Bank.findById(id);
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Hashed password
 * @returns {Promise}
 */
async function createBank(name, email, password,alamatTempatLahir,informasiKeuangan,pekerjaan,penghasilan) {
  return Bank.create({
    name,
    email,
    password,
    alamatTempatLahir,
    informasiKeuangan,
    pekerjaan,
    penghasilan

  });
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {Promise}
 */
async function updateBank(id, name, email) {
  return Bank.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        name,
        email,
      },
    }
  );
}

/**
 * Delete a user
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function deleteBank(id) {
  return Bank.deleteOne({ _id: id });
}

/**
 * Get user by email to prevent duplicate email
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getBankByEmail(email) {
  return Bank.findOne({ email });
}

/**
 * Update user password
 * @param {string} id - User ID
 * @param {string} password - New hashed password
 * @returns {Promise}
 */
async function changePassword(id, password) {
  return Bank.updateOne({ _id: id }, { $set: { password } });
}

module.exports = {
  getBanks,
  getBank,
  createBank,
  updateBank,
  deleteBank,
  getBankByEmail,
  changePassword,
};

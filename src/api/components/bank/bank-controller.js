const banksService = require('./bank-service');
const { errorResponder, errorTypes } = require('../../../core/errors');

/**
 * Handle get list of banks request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getBanks(request, response, next) {
  try {
    //pada function getBanks saya ketik beberapa code tambahan agar pagination,sort,search bisa dilakukan.(535230016 fablius maxleon)
    
    const page_number = parseInt(request.query.page_number) //parseInt ditambahkan untuk memastikan ini adalah integer
    const page_size = parseInt(request.query.page_size)
    const sort = request.query.sort
    const search = request.query.search
    
    //mengambil semua data banks
    let banks = await banksService.getBanks(page_number, page_size);

    
    //ini utk search
    if(search){
      const[x,y]= search.split(':');
      const reg = new RegExp(y);
      banks = banks.filter(bank => bank&& bank[x] && bank[x].match(reg));
    }

    //Pagination
    const startIndex = (page_number-1)*page_size // starting index from 0.
    const endIndex = page_number * page_size
    const paginatedBanks = {}
    paginatedBanks.page_number = page_number
    paginatedBanks.page_size = page_size
    
    //melakukan check apakah ada tidaknya next ataupun previous page.
    if (endIndex < banks.length){
      paginatedBanks.has_next_page = true ;
    }else{
        paginatedBanks.has_next_page = false;

      }
    if (startIndex > 0){
      paginatedBanks.has_previous_page = true;
    }else{
      paginatedBanks.has_previous_page = false;
    }

    //count dibuat untuk mengetahui total data yang ada.
    const count =
      paginatedBanks.count = banks.length
    //totalPages dibuat untuk mengetahui berapa banyak halaman semua data.
    const totalPages =
      paginatedBanks.totalPages = Math.ceil(banks.length/page_size) //Math.ceil biar hasil pembagian tidak coma
    
    //ini utk sorting
    //SORT ASC DAN DESC
    if(sort){
      if(sort === 'email_desc'){
        banks.sort((a,b) => b.email.localeCompare(a.email,undefined,{numeric:true})); // gunakan locale compare dan numeric:true, biar descendingnya berurut
      }else if(sort === 'name_desc'){
        banks.sort((a,b) => b.name.localeCompare(a.name,undefined,{numeric:true}));
      }else{ //DEFAULT SORT ASC (JIKA TIDAK REQUEST QUERY)
        banks.sort((a,b) => a.email.localeCompare(b.email,undefined,{numeric:true}));
      }
    } 
    paginatedBanks.paginatedBanks= banks.slice(startIndex,endIndex)//agar response berada di atas paginatedBanks seperti di contoh soal jadi tarok di akhir.


    const results = paginatedBanks.paginatedBanks.map(bank => ({
        id: bank.id,
        name: bank.name,
        email: bank.email,
  
    }));
    return response.status(200).json(paginatedBanks);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle get bank detail request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getBank(request, response, next) {
  try {
    const bank = await banksService.getBank(request.params.id);

    if (!bank) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Unknown bank');
    }

    return response.status(200).json(bank);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle create user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function createBank(request, response, next) {
  try {
    const name = request.body.name;
    const email = request.body.email;
    const password = request.body.password;
    const password_confirm = request.body.password_confirm;
    alamatTempatLahir = request.body.alatTempatLahir;
    informasiKeuangan = request.body.informasiKeuangan;
    pekerjaan = request.body.pekerjaan;
    penghasilan = request.body.penghasilan;
    // Check confirmation password
    if (password !== password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password confirmation mismatched'
      );
    }

    // Email must be unique
    const emailIsRegistered = await banksService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    const success = await banksService.createBank(name, email, password);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create bank'
      );
    }

    return response.status(200).json({ name, email });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle update user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function updateBank(request, response, next) {
  try {
    const id = request.params.id;
    const name = request.body.name;
    const email = request.body.email;

    // Email must be unique
    const emailIsRegistered = await banksService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    const success = await banksService.updateBank(id, name, email);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to update user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle delete user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deleteBank(request, response, next) {
  try {
    const id = request.params.id;

    const success = await banksService.deleteBank(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle change user password request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function changePassword(request, response, next) {
  try {
    // Check password confirmation
    if (request.body.password_new !== request.body.password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password confirmation mismatched'
      );
    }

    // Check old password
    if (
      !(await banksService.checkPassword(
        request.params.id,
        request.body.password_old
      ))
    ) {
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, 'Wrong password');
    }

    const changeSuccess = await banksService.changePassword(
      request.params.id,
      request.body.password_new
    );

    if (!changeSuccess) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to change password'
      );
    }

    return response.status(200).json({ id: request.params.id });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getBanks,
  getBank,
  createBank,
  updateBank,
  deleteBank,
  changePassword,
};

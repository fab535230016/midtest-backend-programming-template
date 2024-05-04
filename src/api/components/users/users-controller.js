const usersService = require('./users-service');
const { errorResponder, errorTypes } = require('../../../core/errors');

/**
 * Handle get list of users request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getUsers(request, response, next) {
  try {
    //pada function getUsers saya ketik beberapa code tambahan agar pagination,sort,search bisa dilakukan.(535230016 fablius maxleon)
    
    const page_number = parseInt(request.query.page_number) //parseInt ditambahkan untuk memastikan ini adalah integer
    const page_size = parseInt(request.query.page_size)
    const sort = request.query.sort
    const search = request.query.search
    
    //mengambil semua data users
    let users = await usersService.getUsers();

    
    //ini utk search
    if(search){
      const[x,y]= search.split(':');
      const reg = new RegExp(y);
      users = users.filter(user => user&& user[x] && user[x].match(reg));
    }

    //Pagination
    const startIndex = (page_number-1)*page_size // starting index from 0.
    const endIndex = page_number * page_size
    const paginatedUsers = {}
    paginatedUsers.page_number = page_number
    paginatedUsers.page_size = page_size
    
    //melakukan check apakah ada tidaknya next ataupun previous page.
    if (endIndex < users.length){
      paginatedUsers.has_next_page = true ;
    }else{
        paginatedUsers.has_next_page = false;

      }
    if (startIndex > 0){
      paginatedUsers.has_previous_page = true;
    }else{
      paginatedUsers.has_previous_page = false;
    }

    //count dibuat untuk mengetahui total data yang ada.
    const count =
      paginatedUsers.count = users.length
    //totalPages dibuat untuk mengetahui berapa banyak halaman semua data.
    const totalPages =
      paginatedUsers.totalPages = Math.ceil(users.length/page_size) //Math.ceil biar hasil pembagian tidak coma
    
    //ini utk sorting
    //SORT ASC DAN DESC
    if(sort){
      if(sort === 'email_desc'){
        users.sort((a,b) => b.email.localeCompare(a.email,undefined,{numeric:true}));
      }else if(sort === 'name_desc'){
        users.sort((a,b) => b.name.localeCompare(a.name,undefined,{numeric:true}));
      }else{ //DEFAULT SORT ASC
        users.sort((a,b) => a.email.localeCompare(b.email,undefined,{numeric:true}));
      }
    } 
    paginatedUsers.paginatedUsers= users.slice(startIndex,endIndex)//agar response berada di atas paginatedUsers seperti di contoh soal jadi tarok di akhir.


    const results = paginatedUsers.paginatedUsers.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
  
    }));
    return response.status(200).json(paginatedUsers);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle get user detail request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getUser(request, response, next) {
  try {
    const user = await usersService.getUser(request.params.id);

    if (!user) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Unknown user');
    }

    return response.status(200).json(user);
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
async function createUser(request, response, next) {
  try {
    const name = request.body.name;
    const email = request.body.email;
    const password = request.body.password;
    const password_confirm = request.body.password_confirm;

    // Check confirmation password
    if (password !== password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password confirmation mismatched'
      );
    }

    // Email must be unique
    const emailIsRegistered = await usersService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    const success = await usersService.createUser(name, email, password);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create user'
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
async function updateUser(request, response, next) {
  try {
    const id = request.params.id;
    const name = request.body.name;
    const email = request.body.email;

    // Email must be unique
    const emailIsRegistered = await usersService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    const success = await usersService.updateUser(id, name, email);
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
async function deleteUser(request, response, next) {
  try {
    const id = request.params.id;

    const success = await usersService.deleteUser(id);
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
      !(await usersService.checkPassword(
        request.params.id,
        request.body.password_old
      ))
    ) {
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, 'Wrong password');
    }

    const changeSuccess = await usersService.changePassword(
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
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
};

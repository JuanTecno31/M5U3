var pool = require('./bd');

async function getProducts() {
    var query = 'select * from products';
    var rows = await pool.query(query);
    return rows;
}

async function insertProducts(obj) {
    try {
        var query = "insert into products set ?";
        var rows = await pool.query (query, [obj]);
        return rows;
    } catch (error) {
        console.log (error)
        throw error;
    }
}

// para borrar el producto:

async function deleteProductsById(id) {
    var query = "delete from products where id = ?";
    var rows = await pool.query(query, [id]);
    return rows;
}

// para modificar el producto:

async function getProductsById(id) {
    var query = "select * from products where id = ?";
    var rows = await pool.query(query, [id]);
    return rows[0];
}

async function modifyProductsById(obj, id) {
    try {
        var query = "update products set ? where id=?";
        var rows = await pool.query(query, [obj, id]);
        return rows;
    } catch (error) {
        throw error;
    }
}


module.exports = { getProducts, insertProducts, deleteProductsById, getProductsById, modifyProductsById }
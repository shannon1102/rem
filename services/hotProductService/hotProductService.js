'use strict'
const mysql = require('mysql');
const { orderTypeSetting } = require('../../config/index');
const logger = require('../../logger');
const { to } = require('../../helper/to');

class HotProductService {
    constructor(mysqlDb) {
        this.mysqlDb = mysqlDb
    }
    getHotProducts(productsPerPage, pageNumber, orderType, search) {
        return new Promise(
            async (resolve, reject) => {
                let offsetDb = 0, orderByDb;
                orderType = orderType ? orderType : 2
                pageNumber = pageNumber ? pageNumber : 1
                productsPerPage = productsPerPage ? productsPerPage : 10000
                offsetDb = productsPerPage * (pageNumber - 1)
                search = search ? search : ""
                if (orderType == orderTypeSetting.ASC) {
                    orderByDb = 'ASC'
                } else {
                    orderByDb = 'DESC'
                }
                const query =
                    `SELECT p.*,pi.*,hp.product_id,c.main_category_id FROM product as p  
                    JOIN hot_product as hp ON p.id = hp.product_id
                    LEFT JOIN product_image as pi ON pi.product_id = p.id
                    JOIN category as c ON c.id = p.category_id    
                    WHERE 
                    (p.name LIKE ${mysql.escape('%' + search + '%')}
                    OR p.description LIKE ${mysql.escape('%' + search + '%')})
                    ORDER BY p.create_at ${mysql.escape(orderByDb).split(`'`)[1]}
                    LIMIT ${productsPerPage}
                    OFFSET ${mysql.escape(offsetDb)}`
                console.log(query)
                
                let [err, listProduct] = await to(this.mysqlDb.poolQuery(query))
                console.log(listProduct)
                if (err) {
                    logger.error(`[hotProductService][getHotProducts] errors : `, err)
                    return reject(err)
                } else {
                    return resolve(this.returnListHotProduct(listProduct))
                }

            });
    }

    setHotProduct(product_id) {
        return new Promise(async (resolve, reject) => {
            try {
                const getQuery = `SELECT * FROM hot_product 
              WHERE product_id = ${mysql.escape(product_id)}`

                const [err1, result1] = await to(this.mysqlDb.poolQuery(getQuery))
                if (result1.length != 0) {

                    return reject({ message: `hot-product existed` })
                }

                const query = `INSERT INTO hot_product(product_id) 
                VALUES (${mysql.escape(product_id)})
                `
                const [err2, result] = await to(this.mysqlDb.poolQuery(query))
                if (err2) {
                    logger.error(`[hotProductService][createHotProduct] errors: `, err)
                    return reject(err)
                }
                return resolve(result)
            } catch (err) {
                return reject(err)
            }


        })
    }

    unSetHotProduct(product_id) {
        return new Promise(async (resolve, reject) => {
            let query = ``
            try {
                await this.mysqlDb.beginTransaction()
                query = `
                DELETE FROM hot_product
                WHERE product_id = ${mysql.escape(product_id)}
                `
                let result = await this.mysqlDb.poolQuery(query)

                if (result.affectedRows === 0) {
                    return reject(`This product with id ${product_id} is not hot product`)
                }
                await this.mysqlDb.commit()
                await this.mysqlDb.close()
                return resolve(`Remove hot-product with id ${product_id} sucessfully`)
            } catch (err) {
                logger.error(`[hotProductService][deleteHotProduct] errors: `, err)
                await this.mysqlDb.rollback()
                await this.mysqlDb.close()
                return reject(err.sqlMessage)
            }
        })
    }
    returnHotProduct = (e) => {
        return {
            "id": e.product_id,
            "name": e.name,
            "description": e.description,
            "model_number": e.model_number,
            "brand": e.brand,
            "origin": e.origin,
            "thickness": e.thickness,
            "price": e.price,
            "unit_cost": e.unit_cost,
            "material": e.material,
            "weight":e.weight,
            "feature":e.feature,
            "repeat_deg":e.repeat_deg,
            "size": e.size,
            "category_id": e.category_id,
            "main_category_id": e.main_category_id,
            "slug": e.slug,
            "create_at": e.create_at,
            "update_at": e.update_at,
            "list_product_images": [e.url_image1, e.url_image2, e.url_image3, e.url_image4,
            e.url_image5, e.url_image6, e.url_image7, e.url_image8].filter(e1 => (e1 !== null && e1?.length > 0))
        }
    }
    returnListHotProduct = (listProduct) => {
        const returnList = listProduct.map(e => {
            return {
                "id": e.product_id,
                "name": e.name,
                "description": e.description,
                "model_number": e.model_number,
                "brand": e.brand,
                "origin": e.origin,
                "thickness": e.thickness,
                "price": e.price,
                "unit_cost": e.unit_cost,
                "material": e.material,
                "weight":e.weight,
                "feature":e.feature,
                "repeat_deg":e.repeat_deg,
                "size": e.size,
                "category_id": e.category_id,
                "main_category_id": e.main_category_id,
                "slug": e.slug,
                "create_at": e.create_at,
                "update_at": e.update_at,
                "list_product_images": [e.url_image1, e.url_image2, e.url_image3, e.url_image4,
                e.url_image5, e.url_image6, e.url_image7, e.url_image8].filter(e1 => (e1 !== null && e1?.length > 0))
            }
        }
        )
        return returnList;

    }
}

module.exports = HotProductService;
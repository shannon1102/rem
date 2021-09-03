'use strict'
const mysql = require('mysql');
const { orderTypeSetting } = require('../../config/index');
const logger = require('../../logger');
const { to } = require('../../helper/to');
const { resolve } = require('app-root-path');
const { ConsoleTransportOptions } = require('winston/lib/winston/transports');
const {createSlug,removeAccent} = require('../../utils/index')
class ProductService {
    constructor(mysqlDb) {
        this.mysqlDb = mysqlDb
    }
    getProducts(productsPerPage, pageNumber, orderType, search) {
        return new Promise(
            async (resolve, reject) => {
                let offsetDb = 0, orderByDb;
                orderType = orderType ? orderType : 2
                pageNumber = pageNumber ? pageNumber : 1
                productsPerPage = productsPerPage ? productsPerPage : 100
                offsetDb = productsPerPage * (pageNumber - 1)
                // search = search ? search : ""
                let stringSearch= ''
                if(search){
                    stringSearch = search.split(' ').map(element => {
                        return `p.name LIKE ${mysql.escape('%' + element + '%')} OR p.description LIKE ${mysql.escape('%' + element + '%')} 
                        OR p.model_number LIKE ${mysql.escape('%' + element + '%')}`
                    }).join(' OR ')
                    console.log(stringSearch);
                }else {
                    stringSearch = `p.name LIKE ${mysql.escape('%' + "" + '%')} OR p.description LIKE ${mysql.escape('%' + "" + '%')} 
                    OR p.model_number LIKE ${mysql.escape('%' + "" + '%')}`
                }
                if (orderType == orderTypeSetting.ASC) {
                    orderByDb = 'ASC'
                } else {
                    orderByDb = 'DESC'
                }
                
                const query =
            `SELECT p.*,pi.url_image1,pi.url_image2,pi.url_image3,pi.url_image4 FROM product as p
            JOIN product_image AS pi ON p.id = pi.product_id
            WHERE ${stringSearch}
            ORDER BY p.create_at ${mysql.escape(orderByDb).split(`'`)[1]}
            LIMIT ${productsPerPage}
            OFFSET ${mysql.escape(offsetDb)}`
                console.log(query)
                let [err, listProduct] = await to(this.mysqlDb.poolQuery(query))
                let listProductReturn = listProduct.map(e=>{
                    return {
                        "id": e.id,
                        "name": e.name,
                        "description": e.description,
                        "model_number": e.model_number,
                        "main_image_url": e.main_image_url,
                        "price": e.price,
                        "material": e.material,
                        "size": e.size,
                        "category_id": e.category_id,
                        "slug": e.slug,
                        "create_at": e.create_at,
                        "update_at": e.update_at,
                        "list_product_images": [e.url_image1,e.url_image2,e.url_image3,e.url_image4].filter(e1=>(e1 !== null && e1?.length > 0))
                    }
                })
                if (err) {
                    logger.error(`[productService][getProducts] errors : `, err)
                    return reject(err)
                } else {
                    return resolve(listProductReturn)
                }

            });
    }
    getProductsByCategoryId(category_id, productsPerPage, pageNumber, orderType, search) {
        return new Promise(
            async (resolve, reject) => {
                let offsetDb = 0, orderByDb;
                orderType = orderType ? orderType : 2
                pageNumber = pageNumber ? pageNumber : 1
                productsPerPage = productsPerPage ? productsPerPage : 100
                offsetDb = productsPerPage * (pageNumber - 1)
                search = search ? search : ""
                if (orderType == orderTypeSetting.ASC) {
                    orderByDb = 'ASC'
                } else {
                    orderByDb = 'DESC'
                }
                const query =
                    `SELECT p.* FROM product as p
            WHERE p.category_id = ${mysql.escape(category_id)}
            AND ( p.name LIKE ${mysql.escape('%' + search + '%')}
            OR p.description LIKE ${mysql.escape('%' + search + '%')})
            ORDER BY p.create_at ${mysql.escape(orderByDb).split(`'`)[1]}
            LIMIT ${productsPerPage}
            OFFSET ${mysql.escape(offsetDb)}`

                let [err, listProduct] = await to(this.mysqlDb.poolQuery(query))
                if (err) {
                    logger.error(`[productService][getProducts] errors : `, err)
                    return reject(err)
                } else {
                    return resolve(listProduct)
                }

            });

    }
    getProductsByMainCategoryId(id, productsPerPage, pageNumber, orderType, search) {
        return new Promise(
            async (resolve, reject) => {
                let offsetDb = 0, orderByDb;
                orderType = orderType ? orderType : 2
                pageNumber = pageNumber ? pageNumber : 1
                productsPerPage = productsPerPage ? productsPerPage : 10
                offsetDb = productsPerPage * (pageNumber - 1)
                search = search ? search : ""
                if (orderType == orderTypeSetting.ASC) {
                    orderByDb = 'ASC'
                } else {
                    orderByDb = 'DESC'
                }
                const query =
                    `SELECT p.* FROM product as p JOIN category as c ON p.category_id = c.id
            WHERE c.main_category_id = ${mysql.escape(id)}
            AND ( p.name LIKE ${mysql.escape('%' + search + '%')}
            OR p.description LIKE ${mysql.escape('%' + search + '%')})
            ORDER BY p.create_at ${mysql.escape(orderByDb).split(`'`)[1]}
            LIMIT ${productsPerPage}
            OFFSET ${mysql.escape(offsetDb)}`
                console.log(query)
                let [err, listProduct] = await to(this.mysqlDb.poolQuery(query))
                if (err) {
                    logger.error(`[productService][getProducts] errors : `, err)
                    return reject(err)
                } else {
                    return resolve(listProduct)
                }

            });

    }
    getProductsByMainCategoryName(name, productsPerPage, pageNumber, orderType, search) {
        return new Promise(
            async (resolve, reject) => {
                let offsetDb = 0, orderByDb;
                orderType = orderType ? orderType : 2
                pageNumber = pageNumber ? pageNumber : 1
                productsPerPage = productsPerPage ? productsPerPage : 10
                offsetDb = productsPerPage * (pageNumber - 1)
                search = search ? search : ""
                if (orderType == orderTypeSetting.ASC) {
                    orderByDb = 'ASC'
                } else {
                    orderByDb = 'DESC'
                }
                const query =
                    `SELECT p.* FROM product as p 
                    JOIN category as c ON p.category_id = c.id
                    JOIN main_category ON main_category.id = c.main_category_id
            WHERE main_category.name = ${mysql.escape(name)}
            AND ( p.name LIKE ${mysql.escape('%' + search + '%')}
            OR p.description LIKE ${mysql.escape('%' + search + '%')})
            ORDER BY p.create_at ${mysql.escape(orderByDb).split(`'`)[1]}
            LIMIT ${productsPerPage}
            OFFSET ${mysql.escape(offsetDb)}`
                console.log(query)
                let [err, listProduct] = await to(this.mysqlDb.poolQuery(query))
                if (err) {
                    logger.error(`[productService][getProducts] errors : `, err)
                    return reject(err)
                } else {
                    return resolve(listProduct)
                }

            });

    }

    getProductsByCategoryName(main_category,category, productsPerPage, pageNumber, orderType, search) {
        return new Promise(
            async (resolve, reject) => {
                let offsetDb = 0, orderByDb;
                orderType = orderType ? orderType : 2
                pageNumber = pageNumber ? pageNumber : 1
                productsPerPage = productsPerPage ? productsPerPage : 10
                offsetDb = productsPerPage * (pageNumber - 1)
                search = search ? search : ""
                if (orderType == orderTypeSetting.ASC) {
                    orderByDb = 'ASC'
                } else {
                    orderByDb = 'DESC'
                }
                const query =
                    `SELECT p.* FROM product as p
            JOIN category ON p.category_id = category.id 
            JOIN main_category ON main_category.id = category.main_category_id 
            WHERE  main_category.name = ${mysql.escape(main_category)}
            AND category.name = ${mysql.escape(category)}
            AND (p.name LIKE ${mysql.escape('%' + search + '%')}
            OR p.description LIKE ${mysql.escape('%' + search + '%')})
            ORDER BY p.create_at ${mysql.escape(orderByDb).split(`'`)[1]}
            LIMIT ${productsPerPage}
            OFFSET ${mysql.escape(offsetDb)}`
                console.log(query)
                let [err, listProduct] = await to(this.mysqlDb.poolQuery(query))
                if (err) {
                    logger.error(`[productService][getProducts] errors : `, err)
                    return reject(err)
                } else {
                    return resolve(listProduct)
                }

            });

    }
    getProductsByCategoryAndMaterial(main_category_name,category_name, material, productsPerPage, pageNumber, orderType, search) {
        
        if(!main_category_name || main_category_name.toLowerCase() ==='all') {
            main_category_name = ""
        }
        if(!category_name || category_name.toLowerCase() === 'all') {
            category_name = ""
        }
        if(!material || material.toLowerCase() === 'all') {
            material = ""
        }

        return new Promise(
            async (resolve, reject) => {
                let offsetDb = 0, orderByDb;
                orderType = orderType ? orderType : 2
                pageNumber = pageNumber ? pageNumber : 1
                productsPerPage = productsPerPage ? productsPerPage : 1000
                offsetDb = productsPerPage * (pageNumber - 1)
                search = search ? search : ""
                console.log(main_category_name);
                console.log(category_name);
                console.log(material);
                if (orderType == orderTypeSetting.ASC) {
                    orderByDb = 'ASC'
                } else {
                    orderByDb = 'DESC'
                }
                const query =
                    `SELECT p.* FROM product as p
            JOIN category ON p.category_id = category.id 
            JOIN main_category ON main_category.id = category.main_category_id
            WHERE 
            main_category.name LIKE ${mysql.escape('%'+main_category_name+'%')}
            AND category.name LIKE ${mysql.escape('%' + category_name +'%' )}
            AND p.material LIKE ${mysql.escape('%' + material + '%')}
            ORDER BY p.create_at ${mysql.escape(orderByDb).split(`'`)[1]}
            LIMIT ${productsPerPage}
            OFFSET ${mysql.escape(offsetDb)}`
                console.log(query)
                let [err, listProduct] = await to(this.mysqlDb.poolQuery(query))
                if (err) {
                    logger.error(`[productService][getProducts] errors : `, err)
                    return reject(err)
                } else {
                    return resolve(listProduct)
                }

            });
    }
    getProductById(id) {

        return new Promise(async (resolve, reject) => {

            const query = `
            SELECT * FROM product_image AS pi
            WHERE pi.product_id = ${mysql.escape(id)}`
            const [err, list_image_result] = await to(this.mysqlDb.poolQuery(query))
            const listImageReturn = 
            [list_image_result[0].url_image1,list_image_result[0].url_image2,list_image_result[0].url_image3,list_image_result[0].url_image4].filter(e=>
                (e !== null && e?.length > 0)
            );
            console.log(listImageReturn);
      
            const query1 =
                `SELECT p.*,c.main_category_id
            FROM product AS p
            JOIN category AS c
            ON c.id = p.category_id
            JOIN main_category AS mc
            ON mc.id = c.main_category_id
            WHERE p.id = ${mysql.escape(id)}`
            console.log("dsdas");
            console.log(query1)
            const [err1, productResult] = await to(this.mysqlDb.poolQuery(query1))
            console.log(productResult);
            if (err1) {
                logger.error(`[productService][getProductById] errors: `, err)
                return reject(err)
            }
            if (!productResult.length) {
                return reject(`product with id ${id} not found`)
            }

            productResult[0].list_product_images = listImageReturn;
            console.log(productResult[0])
            return resolve(productResult[0])
        })
    }
    getProductBySlug(slug) {

        return new Promise(async (resolve, reject) => {
            try {

                const query0 = `
                SELECT id FROM  product AS p
                WHERE p.slug = ${mysql.escape(slug)}`

                const [error, result0] = await to(this.mysqlDb.poolQuery(query0))
                console.log(result0)
                const id = result0[0].id
                const query = `
                SELECT * FROM product_image AS pi
                WHERE pi.product_id = ${mysql.escape(id)}`
                const [err, list_image_result] = await to(this.mysqlDb.poolQuery(query))
                let listImage =  [list_image_result[0].url_image1,list_image_result[0].url_image2,list_image_result[0].url_image3,list_image_result[0].url_image4].filter(e=>
                    (e !== null && e?.length > 0)
                );

                const query1 =
                    `SELECT p.*,c.main_category_id
                    FROM product AS p
                    JOIN category AS c
                    ON c.id = p.category_id
                    JOIN main_category AS mc
                    ON mc.id = c.main_category_id
                    WHERE p.id = ${mysql.escape(id)}`

                console.log(query1)
                const [err1, productResult] = await to(this.mysqlDb.poolQuery(query1))
                console.log(productResult);
                if (err1) {
                    logger.error(`[productService][getProductById] errors: `, err)
                    return reject(err1)
                }
                if (!productResult.length) {
                    return reject(`product with id ${id} not found`)
                }

                productResult[0].list_product_images = listImage;
                console.log(productResult[0])
                return resolve(productResult[0])

            } catch (error) {
                logger.error(error);
                return reject(error)

            }


        })
    }

    getProductByCode(model_number, productsPerPage, pageNumber, orderType) {

        return new Promise(async (resolve, reject) => {
            let offsetDb = 0, orderByDb;
            orderType = orderType ? orderType : 2
            pageNumber = pageNumber ? pageNumber : 1
            productsPerPage = productsPerPage ? productsPerPage : 100
            offsetDb = productsPerPage * (pageNumber - 1)
            if (orderType == orderTypeSetting.ASC) {
                orderByDb = 'ASC'
            } else {
                orderByDb = 'DESC'
            }
            const query1 =
                `SELECT *
            FROM product AS p
            WHERE p.model_number = ${mysql.escape(model_number)}
            ORDER BY p.create_at ${mysql.escape(orderByDb).split(`'`)[1]}
            LIMIT ${productsPerPage}
            OFFSET ${mysql.escape(offsetDb)}
            `
            const [err1, productResult] = await to(this.mysqlDb.poolQuery(query1))
            if (err1) {
                logger.error(`[productService][getProductById] errors: `, err)
                return reject(err)
            }
            if (!productResult.length) {
                return reject(`product with model number ${model_number} not found`)
            }
            return resolve(productResult)
        })
    }

    createProduct(name, description, model_number, list_product_images, origin,
        brand,thickness, price, material, size, category_id) {

        const slug = createSlug(name);
        console.log('slug', slug);
        const url_image1 = list_product_images[0] ? list_product_images[0] : null;
        const url_image2 = list_product_images[1] ? list_product_images[1] : null;
        const url_image3 = list_product_images[2] ? list_product_images[2] : null;
        const url_image4 = list_product_images[3] ? list_product_images[3] : null;
        const url_image5 = list_product_images[4] ? list_product_images[4] : null;
        const url_image6 = list_product_images[5] ? list_product_images[5] : null;
        const url_image7 = list_product_images[6] ? list_product_images[6] : null;
        const url_image8 = list_product_images[7] ? list_product_images[7] : null;
        return new Promise(async (resolve, reject) => {
            try {
            await this.mysqlDb.beginTransaction()
            const query = `INSERT INTO product(name,description,model_number,origin,
                brand,thickness,price,material,size, category_id,slug) 
            VALUES (${mysql.escape(name)},${mysql.escape(description)},${mysql.escape(model_number)},
            ${mysql.escape(origin)},${mysql.escape(brand)},${mysql.escape(thickness)},
            ${mysql.escape(price)},${mysql.escape(material)},${mysql.escape(size)},${mysql.escape(category_id)},${mysql.escape(slug)})
            `
            const [err0, result] = await to(this.mysqlDb.poolQuery(query))
            if (err0) {
                logger.error(`[productService][createProduct] errors: `,err0)
                return reject(err0)
            }
            console.log(result);
            const insertId = result.insertId;

            const query2 = `INSERT INTO product_image (product_id,url_image1,url_image2,url_image3,url_image4,url_image5,url_image6,url_image7,url_image8) 
            VALUES (${mysql.escape(insertId)},${mysql.escape(url_image1)},${mysql.escape(url_image2)},${mysql.escape(url_image3)},${mysql.escape(url_image4)},
            ${mysql.escape(url_image5)},${mysql.escape(url_image6)},${mysql.escape(url_image7)},${mysql.escape(url_image8)})`
            const [err2, result2] = await to(this.mysqlDb.poolQuery(query2))
            console.log(query2)
            if (err2) {
                logger.error(`[productService][createProduct] errors: `, err2)
                return reject(err2)
            }
            await this.mysqlDb.commit()
            return resolve()
                
            } catch (error) {
                logger.error(`[productService][createProduct] errors: `, error)
                await this.mysqlDb.rollback()
                return reject(error.sqlMessage)
            }
        })
    }
    updateProduct(id, name, description, model_number, list_product_images, origin,
        brand,thickness, price, material, size, category_id) {
        const url_image1 = list_product_images[0] ? list_product_images[0] : null;
        const url_image2 = list_product_images[1] ? list_product_images[1] : null;
        const url_image3 = list_product_images[2] ? list_product_images[2] : null;
        const url_image4 = list_product_images[3] ? list_product_images[3] : null;
        const url_image5 = list_product_images[4] ? list_product_images[4] : null;
        const url_image6 = list_product_images[5] ? list_product_images[5] : null;
        const url_image7 = list_product_images[6] ? list_product_images[6] : null;
        const url_image8 = list_product_images[7] ? list_product_images[7] : null;
        return new Promise(async (resolve, reject) => {
            try {
                await this.mysqlDb.beginTransaction()
                const query = `UPDATE product
               SET name = ${mysql.escape(name)},
               description = ${mysql.escape(description)},
               model_number = ${mysql.escape(model_number)},
               origin = ${mysql.escape(origin)},
               brand = ${mysql.escape(brand)},
               thickness = ${mysql.escape(thickness)},
               price = ${mysql.escape(price)},
               material= ${mysql.escape(material)},
               size= ${mysql.escape(size)},
               category_id = ${mysql.escape(category_id)}
               WHERE id = ${mysql.escape(id)}
               `
            const [err, result] = await to(this.mysqlDb.poolQuery(query))
            if (err) {
                logger.error(`[productService][updateProduct] errors: `, err)
                return reject(err)
            }
            const query1 = `UPDATE product_image
            SET url_image1 = ${mysql.escape(url_image1)},
            url_image2 = ${mysql.escape(url_image2)},
            url_image3 = ${mysql.escape(url_image3)},
            url_image4 = ${mysql.escape(url_image4)},
            url_image5 = ${mysql.escape(url_image5)},
            url_image6 = ${mysql.escape(url_image6)},
            url_image7 = ${mysql.escape(url_image7)},
            url_image8 = ${mysql.escape(url_image8)}
            WHERE product_id = ${mysql.escape(id)}
            `
            const [err1, result1] = await to(this.mysqlDb.poolQuery(query1))
            if (err1) {
                logger.error(`[productService][updateProductImage] errors: `, err1)
                return reject(err1)
            }
            await this.mysqlDb.commit()
            return resolve()

        }catch(error){
            logger.error(`[productService][createProduct] errors: `, error)
            await this.mysqlDb.rollback()
            return reject(error.sqlMessage)
        }
        })
   
    }
    deleteProduct(id) {
        return new Promise(async (resolve, reject) => {
            let query = ``
            try {
                await this.mysqlDb.beginTransaction()
                query = `SELECT COUNT(*) AS numProduct FROM product WHERE id = ${mysql.escape(id)}`
                let result1 = await this.mysqlDb.poolQuery(query)
                if (!result1[0].numProduct) {
                    return reject(`Product with id ${id} not found`)
                }
                query = `
                DELETE FROM product
                WHERE id = ${mysql.escape(id)}
                `
                let result3 = await this.mysqlDb.poolQuery(query)

                if (result3.affectedRows === 0) {
                    return reject(`Delete product with id ${id} not sucessfully`)
                }
                await this.mysqlDb.commit()
                return resolve(`Delete product with id ${id} sucessfully`)
            } catch (err) {
                logger.error(`[productService][deleteProduct] errors: `, err)
                await this.mysqlDb.rollback()
                return reject(err.sqlMessage)
            }
        })
    }
    updateProductImage(product_id, url_image1, url_image2, url_image3, url_image4) {
        return new Promise(async (resolve, reject) => {
            const query = `UPDATE product_image
            SET url_image1 = ${mysql.escape(url_image1)},
            url_image2 = ${mysql.escape(url_image2)},
            url_image3 = ${mysql.escape(url_image3)},
            url_image4 = ${mysql.escape(url_image4)}
            WHERE product_id = ${mysql.escape(product_id)}
            `

            const [err, result] = await to(this.mysqlDb.poolQuery(query))

            if (err) {
                logger.error(`[productService][updateProductImage] errors: `, err)
                return reject(err)
            }
            if (result.affectedRows == 0) {
                return reject(`Not found product with id ${product_id}`);
            }

            return resolve(`Upload product-image with id ${product_id} sucessfully`);
        })
    }
    uploadProductImage(product_id, url_image1, url_image2, url_image3, url_image4) {
        return new Promise(async (resolve, reject) => {
            const query = `INSERT INTO product_image (product_id,url_image1,url_image2,url_image3,url_image4) 
            VALUES (${mysql.escape(product_id)},${mysql.escape(url_image1)},${mysql.escape(url_image2)},${mysql.escape(url_image3)},${mysql.escape(url_image4)})
            `
            console.log(query);
            const [err, result] = await to(this.mysqlDb.poolQuery(query))
            console.log(result);
            if (err) {
                logger.error(`[productService][updateProductImage] errors: `, err)
                return reject(err)
            }
            return resolve(`Upload product-image with id ${product_id} sucessfully`)
        })
    }
    getListMaterial(){
       return new Promise(async (resolve,reject)=>{
        const query = `
        SELECT material FROM product GROUP BY material;  
        `
        console.log(query)
        const [err,listMaterial] = await to(this.mysqlDb.poolQuery(query));
        console.log(listMaterial)
          if (err) {
                logger.error(`[productService][getMaterial] errors: `, err)
                return reject(err)
            }
            return resolve(listMaterial)
       }) 
    }
    getListBrands(){
        return new Promise(async (resolve,reject)=>{
         const query = `
         SELECT brand FROM product GROUP BY brand;  
         `
         console.log(query)
         const [err,listBrands] = await to(this.mysqlDb.poolQuery(query));
         console.log(listBrands)
           if (err) {
                 logger.error(`[productService][getMaterial] errors: `, err)
                 return reject(err)
             }
             return resolve(listBrands)
        }) 
     }
}

module.exports = ProductService;
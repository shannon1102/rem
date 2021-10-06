'use strict'
const mysql = require('mysql');
const { orderTypeSetting } = require('../../config/index');
const logger = require('../../logger');
const { to } = require('../../helper/to');
const { createSlug, removeAccent } = require('../../utils/index')
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
                productsPerPage = productsPerPage ? productsPerPage : 10000
                offsetDb = productsPerPage * (pageNumber - 1)
                // search = search ? search : ""
                let stringSearch = ''
                if (search) {
                    stringSearch = search.split(' ').map(element => {
                        return `p.name LIKE ${mysql.escape('%' + element + '%')} OR p.description LIKE ${mysql.escape('%' + element + '%')} 
                        OR p.model_number LIKE ${mysql.escape('%' + element + '%')}`
                    }).join(' OR ')
                    console.log(stringSearch);
                } else {
                    stringSearch = `p.name LIKE ${mysql.escape('%' + "" + '%')} OR p.description LIKE ${mysql.escape('%' + "" + '%')} 
                    OR p.model_number LIKE ${mysql.escape('%' + "" + '%')}`
                }
                if (orderType == orderTypeSetting.ASC) {
                    orderByDb = 'ASC'
                } else {
                    orderByDb = 'DESC'
                }
                const queryCounter = `SELECT COUNT(*) as total FROM product as p WHERE (${stringSearch})`;
                console.log(queryCounter);
                const countProductResult = await this.mysqlDb.poolQuery(queryCounter);
                const total_product = countProductResult[0].total;
                const query =
                    `SELECT p.*,c.main_category_id,pi.url_image1,pi.url_image2,pi.url_image3,pi.url_image4,
                    pi.url_image5,pi.url_image6,pi.url_image7,pi.url_image8  
                    FROM product as p
                    LEFT JOIN product_image AS pi ON p.id = pi.product_id
                    JOIN category AS c ON c.id = p.category_id
                    WHERE ${stringSearch}
                    ORDER BY p.create_at ${mysql.escape(orderByDb).split(`'`)[1]}
                    LIMIT ${productsPerPage}
                    OFFSET ${mysql.escape(offsetDb)}`
                let [err, listProduct] = await to(this.mysqlDb.poolQuery(query))
                let listProductReturn = this.returnListProduct(listProduct)
                if (err) {
                    logger.error(`[productService][getProducts] errors : `, err)
                    return reject(err)
                } else {
                    return resolve({ total: total_product, listProductReturn })
                }

            });
    }
    getLibProductImages(productsPerPage, pageNumber, orderType, search) {
        return new Promise(
            async (resolve, reject) => {
                let offsetDb = 0, orderByDb;
                orderType = orderType ? orderType : 2
                pageNumber = pageNumber ? pageNumber : 1
                productsPerPage = productsPerPage ? productsPerPage : 10000
                offsetDb = productsPerPage * (pageNumber - 1)
                // search = search ? search : ""
                let stringSearch = ''
                if (search) {
                    stringSearch = search.split(' ').map(element => {
                        return `p.name LIKE ${mysql.escape('%' + element + '%')} OR p.description LIKE ${mysql.escape('%' + element + '%')} 
                        OR p.model_number LIKE ${mysql.escape('%' + element + '%')}`
                    }).join(' OR ')
                    console.log(stringSearch);
                } else {
                    stringSearch = `p.name LIKE ${mysql.escape('%' + "" + '%')} OR p.description LIKE ${mysql.escape('%' + "" + '%')} 
                    OR p.model_number LIKE ${mysql.escape('%' + "" + '%')}`
                }
                if (orderType == orderTypeSetting.ASC) {
                    orderByDb = 'ASC'
                } else {
                    orderByDb = 'DESC'
                }

                const query =
                    `SELECT p.*,c.main_category_id,mc.name as main_category_name,mc.slug as main_category_slug,pi.url_image1,pi.url_image2,pi.url_image3,pi.url_image4,
                    pi.url_image5,pi.url_image6,pi.url_image7,pi.url_image8  
                    FROM product as p
                    JOIN product_image AS pi ON p.id = pi.product_id
                    JOIN category AS c ON c.id = p.category_id
                    JOIN main_category AS mc ON mc.id = c.main_category_id
                    WHERE ${stringSearch}
                    ORDER BY p.create_at ${mysql.escape(orderByDb).split(`'`)[1]}
                    LIMIT ${productsPerPage}
                    OFFSET ${mysql.escape(offsetDb)}`
                console.log(query)
                let [err, listProduct] = await to(this.mysqlDb.poolQuery(query))
                console.log(listProduct)
                let listProductImgsReturn = this.returnLibProductImages(listProduct)
                if (err) {
                    logger.error(`[productService][getProducts] errors : `, err)
                    return reject(err)
                } else {
                    return resolve(listProductImgsReturn)
                }

            });
    }
    getProductsByCategoryId(category_id, productsPerPage, pageNumber, orderType, search) {
        return new Promise(
            async (resolve, reject) => {
                let offsetDb = 0, orderByDb;
                orderType = orderType ? orderType : 2
                pageNumber = pageNumber ? pageNumber : 1
                productsPerPage = productsPerPage ? productsPerPage : 10000
                offsetDb = productsPerPage * (pageNumber - 1)
                let stringSearch = ''
                if (search) {
                    stringSearch = search.split(' ').map(element => {
                        return `p.name LIKE ${mysql.escape('%' + element + '%')} OR p.description LIKE ${mysql.escape('%' + element + '%')} 
                        OR p.model_number LIKE ${mysql.escape('%' + element + '%')}`
                    }).join(' OR ')
                    console.log(stringSearch);
                } else {
                    stringSearch = `p.name LIKE ${mysql.escape('%' + "" + '%')} OR p.description LIKE ${mysql.escape('%' + "" + '%')} 
                    OR p.model_number LIKE ${mysql.escape('%' + "" + '%')}`
                }
                if (orderType == orderTypeSetting.ASC) {
                    orderByDb = 'ASC'
                } else {
                    orderByDb = 'DESC'
                }
                const queryCounter = `SELECT COUNT(*) as total FROM product as p WHERE p.category_id = ${category_id} AND (${stringSearch})`;
                console.log(queryCounter);
                const countProductResult = await this.mysqlDb.poolQuery(queryCounter);
                const total_product = countProductResult[0].total;

                const query =
                    `SELECT p.*,c.main_category_id,pi.url_image1,pi.url_image2,pi.url_image3,pi.url_image4,
                pi.url_image5,pi.url_image6,pi.url_image7,pi.url_image8  
                FROM product as p
                JOIN product_image AS pi ON p.id = pi.product_id
                JOIN category AS c ON p.category_id = c.id
                WHERE p.category_id = ${mysql.escape(category_id)}
                AND (${stringSearch})
                ORDER BY p.create_at ${mysql.escape(orderByDb).split(`'`)[1]}
                LIMIT ${productsPerPage}
                OFFSET ${mysql.escape(offsetDb)}`

                let [err, listProduct] = await to(this.mysqlDb.poolQuery(query))
                if (err) {
                    logger.error(`[productService][getProducts] errors : `, err)
                    return reject(err)
                } else {
                    let listProductReturn = this.returnListProduct(listProduct)
                    return resolve({ total: total_product, listProductReturn })
                }

            });

    }
    getProductsByCategorySlug(slug, productsPerPage, pageNumber, orderType, search) {
        return new Promise(
            async (resolve, reject) => {
                let offsetDb = 0, orderByDb;
                orderType = orderType ? orderType : 2
                pageNumber = pageNumber ? pageNumber : 1
                productsPerPage = productsPerPage ? productsPerPage : 10000
                offsetDb = productsPerPage * (pageNumber - 1)
                let stringSearch = ''
                if (search) {
                    stringSearch = search.split(' ').map(element => {
                        return `p.name LIKE ${mysql.escape('%' + element + '%')} OR p.description LIKE ${mysql.escape('%' + element + '%')} 
                        OR p.model_number LIKE ${mysql.escape('%' + element + '%')}`
                    }).join(' OR ')
                    console.log(stringSearch);
                } else {
                    stringSearch = `p.name LIKE ${mysql.escape('%' + "" + '%')} OR p.description LIKE ${mysql.escape('%' + "" + '%')} 
                    OR p.model_number LIKE ${mysql.escape('%' + "" + '%')}`
                }
                if (orderType == orderTypeSetting.ASC) {
                    orderByDb = 'ASC'
                } else {
                    orderByDb = 'DESC'
                }

                const queryCounter = `SELECT COUNT(*) as total FROM product as p
                LEFT JOIN category as c ON c.id = p.category_id
                WHERE c.slug = ${mysql.escape(slug)} AND (${stringSearch})`;
                console.log(queryCounter);
                const countProductResult = await this.mysqlDb.poolQuery(queryCounter);
                const total_product = countProductResult[0].total;
                const query =
                    `SELECT p.*,c.main_category_id,pi.url_image1,pi.url_image2,pi.url_image3,pi.url_image4,
                pi.url_image5,pi.url_image6,pi.url_image7,pi.url_image8  
                FROM product as p JOIN product_image AS pi ON p.id = pi.product_id
                JOIN category AS c ON p.category_id = c.id
                WHERE c.slug = ${mysql.escape(slug)}
                AND (${stringSearch})
                ORDER BY p.create_at ${mysql.escape(orderByDb).split(`'`)[1]}
                LIMIT ${productsPerPage}
                OFFSET ${mysql.escape(offsetDb)}`

                let [err, listProduct] = await to(this.mysqlDb.poolQuery(query))
                if (err) {
                    logger.error(`[productService][getProducts] errors : `, err)
                    return reject(err)
                } else {
                    let listProductReturn = this.returnListProduct(listProduct)
                    return resolve({ total: total_product, listProductReturn })
                }
            });
    }
    getProductsByMainCategoryId(id, productsPerPage, pageNumber, orderType, search) {
        return new Promise(
            async (resolve, reject) => {
                let offsetDb = 0, orderByDb;
                orderType = orderType ? orderType : 2
                pageNumber = pageNumber ? pageNumber : 1
                productsPerPage = productsPerPage ? productsPerPage : 100000
                offsetDb = productsPerPage * (pageNumber - 1)
                let stringSearch = ''
                if (search) {
                    stringSearch = search.split(' ').map(element => {
                        return `p.name LIKE ${mysql.escape('%' + element + '%')} OR p.description LIKE ${mysql.escape('%' + element + '%')} 
                        OR p.model_number LIKE ${mysql.escape('%' + element + '%')}`
                    }).join(' OR ')
                    console.log(stringSearch);
                } else {
                    stringSearch = `p.name LIKE ${mysql.escape('%' + "" + '%')} OR p.description LIKE ${mysql.escape('%' + "" + '%')} 
                    OR p.model_number LIKE ${mysql.escape('%' + "" + '%')}`
                }
                if (orderType == orderTypeSetting.ASC) {
                    orderByDb = 'ASC'
                } else {
                    orderByDb = 'DESC'
                }
                const queryCounter = `SELECT COUNT(*) as total FROM product as p
                LEFT JOIN category as c ON c.id = p.category_id
                JOIN main_category as mc ON mc.id =c.main_category_id
                WHERE c.main_category_id = ${mysql.escape(id)} AND (${stringSearch})`;
                console.log(queryCounter);
                const countProductResult = await this.mysqlDb.poolQuery(queryCounter);
                const total_product = countProductResult[0].total;
                const query =
                    `SELECT p.*,c.main_category_id,pi.url_image1,pi.url_image2,pi.url_image3,pi.url_image4,
                pi.url_image5,pi.url_image6,pi.url_image7,pi.url_image8  
                FROM product as p
                JOIN product_image AS pi ON p.id = pi.product_id
                JOIN category AS c ON c.id = p.category_id
                JOIN main_category AS mc ON mc.id = c.main_category_id  
                WHERE mc.id = ${mysql.escape(id)}
                AND (${stringSearch})
                ORDER BY p.create_at ${mysql.escape(orderByDb).split(`'`)[1]}
                LIMIT ${productsPerPage}
                OFFSET ${mysql.escape(offsetDb)}`

                let [err, listProduct] = await to(this.mysqlDb.poolQuery(query))
                if (err) {
                    logger.error(`[productService][getProducts] errors : `, err)
                    return reject(err)
                } else {

                    let listProductReturn = this.returnListProduct(listProduct)
                    return resolve({ total: total_product, listProductReturn })
                }

            });

    }
    getProductsByMainCategorySlug(slug, productsPerPage, pageNumber, orderType, search) {
        return new Promise(
            async (resolve, reject) => {
                console.log(">???")
                let offsetDb = 0, orderByDb;
                orderType = orderType ? orderType : 2
                pageNumber = pageNumber ? pageNumber : 1
                productsPerPage = productsPerPage ? productsPerPage : 100000
                offsetDb = productsPerPage * (pageNumber - 1)
                let stringSearch = ''
                if (search) {
                    stringSearch = search.split(' ').map(element => {
                        return `p.name LIKE ${mysql.escape('%' + element + '%')} OR p.description LIKE ${mysql.escape('%' + element + '%')} 
                        OR p.model_number LIKE ${mysql.escape('%' + element + '%')}`
                    }).join(' OR ')
                    console.log(stringSearch);
                } else {
                    stringSearch = `p.name LIKE ${mysql.escape('%' + "" + '%')} OR p.description LIKE ${mysql.escape('%' + "" + '%')} 
                    OR p.model_number LIKE ${mysql.escape('%' + "" + '%')}`
                }
                if (orderType == orderTypeSetting.ASC) {
                    orderByDb = 'ASC'
                } else {
                    orderByDb = 'DESC'
                }
                const query =
                    `SELECT p.*,c.main_category_id,pi.url_image1,pi.url_image2,pi.url_image3,pi.url_image4,
                pi.url_image5,pi.url_image6,pi.url_image7,pi.url_image8  
                FROM product as p
                JOIN product_image AS pi ON p.id = pi.product_id
                JOIN category AS c ON c.id = p.category_id
                JOIN main_category AS mc ON mc.id = c.main_category_id  
                WHERE mc.slug = ${mysql.escape(slug)}
                AND (${stringSearch})
                ORDER BY p.create_at ${mysql.escape(orderByDb).split(`'`)[1]}
                LIMIT ${productsPerPage}
                OFFSET ${mysql.escape(offsetDb)}`

                let [err, listProduct] = await to(this.mysqlDb.poolQuery(query))
                console.log(query)
                if (err) {
                    logger.error(`[productService][getProducts] errors : `, err)
                    return reject(err)
                } else {
                    return resolve(this.returnListProduct(listProduct))
                }

            });

    }
    getProductsByMixCategorySlug(slug, productsPerPage, pageNumber, orderType, search) {
        return new Promise(
            async (resolve, reject) => {
                let offsetDb = 0, orderByDb;
                orderType = orderType ? orderType : 2
                pageNumber = pageNumber ? pageNumber : 1
                productsPerPage = productsPerPage ? productsPerPage : 100000
                offsetDb = productsPerPage * (pageNumber - 1)
                let stringSearch = ''
                if (search) {
                    stringSearch = search.split(' ').map(element => {
                        return `p.name LIKE ${mysql.escape('%' + element + '%')} OR p.description LIKE ${mysql.escape('%' + element + '%')} 
                        OR p.model_number LIKE ${mysql.escape('%' + element + '%')}`
                    }).join(' OR ')
                    console.log(stringSearch);
                } else {
                    stringSearch = `p.name LIKE ${mysql.escape('%' + "" + '%')} OR p.description LIKE ${mysql.escape('%' + "" + '%')} 
                    OR p.model_number LIKE ${mysql.escape('%' + "" + '%')}`
                }
                if (orderType == orderTypeSetting.ASC) {
                    orderByDb = 'ASC'
                } else {
                    orderByDb = 'DESC'
                }
                const queryCounter = `SELECT COUNT(*) as total FROM product as p
                LEFT JOIN category as c ON c.id = p.category_id
                JOIN main_category as mc ON mc.id =c.main_category_id
                WHERE (c.slug = ${mysql.escape(slug)} OR mc.slug = ${mysql.escape(slug)})
                AND (${stringSearch})`;
                console.log(queryCounter);
                const countProductResult = await this.mysqlDb.poolQuery(queryCounter);
                const total_product = countProductResult[0].total;
                const query =
                    `SELECT p.*,c.main_category_id,pi.url_image1,pi.url_image2,pi.url_image3,pi.url_image4,
                pi.url_image5,pi.url_image6,pi.url_image7,pi.url_image8  
                FROM product as p
                JOIN product_image AS pi ON p.id = pi.product_id
                JOIN category AS c ON c.id = p.category_id
                JOIN main_category AS mc ON mc.id = c.main_category_id  
                WHERE (mc.slug = ${mysql.escape(slug)} OR c.slug = ${mysql.escape(slug)})
                AND (${stringSearch})
                ORDER BY p.create_at ${mysql.escape(orderByDb).split(`'`)[1]}
                LIMIT ${productsPerPage}
                OFFSET ${mysql.escape(offsetDb)}`

                let [err, listProduct] = await to(this.mysqlDb.poolQuery(query))
                console.log(query)
                if (err) {
                    logger.error(`[productService][getProducts] errors : `, err)
                    return reject(err)
                } else {
                    let listProductReturn = this.returnListProduct(listProduct)
                    return resolve({ total: total_product, listProductReturn })
                }

            });

    }

    getProductById(id) {

        return new Promise(async (resolve, reject) => {
            const query1 =
                `SELECT p.*,pi.url_image1,pi.url_image2,pi.url_image3,pi.url_image4,
                pi.url_image5,pi.url_image6,pi.url_image7,pi.url_image8,c.main_category_id
                FROM product AS p
                JOIN product_image AS pi ON p.id = pi.product_id
                JOIN category AS c ON c.id = p.category_id
                JOIN main_category AS mc ON mc.id = c.main_category_id
                WHERE p.id = ${mysql.escape(id)}`
            console.log(query1)
            const [err1, productResult] = await to(this.mysqlDb.poolQuery(query1))
            console.log(productResult);
            if (err1) {
                logger.error(`[productService][getProductById] errors: `, err1)
                return reject(err1)
            }
            if (!productResult.length) {
                return reject(`product with id ${id} not found`)
            }

            console.log(productResult[0])
            return resolve(this.returnProduct(productResult[0]))
        })
    }
    getProductBySlug(slug) {

        return new Promise(async (resolve, reject) => {
            try {
                const query1 =
                    `SELECT p.*,pi.url_image1,pi.url_image2,pi.url_image3,pi.url_image4,
                pi.url_image5,pi.url_image6,pi.url_image7,pi.url_image8,c.main_category_id
                FROM product AS p
                JOIN product_image AS pi ON p.id = pi.product_id
                JOIN category AS c ON c.id = p.category_id
                JOIN main_category AS mc ON mc.id = c.main_category_id
                WHERE p.slug = ${mysql.escape(slug)}`

                console.log(query1)
                const [err1, productResult] = await to(this.mysqlDb.poolQuery(query1))
                console.log(productResult);
                if (err1) {
                    logger.error(`[productService][getProductById] errors: `, err)
                    return reject(err1)
                }
                if (!productResult.length) {
                    return reject(`product with id ${slug} not found`)
                }
                console.log(productResult[0])
                return resolve(this.returnProduct(productResult[0]))

            } catch (error) {
                logger.error(error);
                return reject(error)

            }


        })
    }
    createProduct(name, description, model_number, list_product_images, origin,
        brand, thickness, price, unit_cost, material, weight, feature, repeat_deg, size, category_id) {
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
            this.mysqlDb.pool.getConnection(
                async (err, connection) => {
                    if (err) {
                        logger.error(`[tutorialService][addPost] Getting connection from pool failed \n ${err}`, { filename: `${__filename}` })
                        reject(err)
                    } else {
                        connection.beginTransaction(async err => {
                            if (err) {
                                logger.error(`Begin transaction fail`, { filename: `${__filename}` })
                                connection.rollback(() => {
                                    connection.release()
                                    reject(err)
                                })
                            } else {

                                const query = `INSERT INTO product(name,description,model_number,origin,
                                        brand,thickness,price,unit_cost,material,weight,feature,repeat_deg,size, category_id,slug) 
                                    VALUES (${mysql.escape(name)},${mysql.escape(description)},${mysql.escape(model_number)},
                                    ${mysql.escape(origin)},${mysql.escape(brand)},${mysql.escape(thickness)},
                                    ${mysql.escape(price)},${mysql.escape(unit_cost)},${mysql.escape(material)},${mysql.escape(weight)},
                                    ${mysql.escape(feature)},${mysql.escape(repeat_deg)},${mysql.escape(size)},${mysql.escape(category_id)},${mysql.escape(slug)})
                                    `
                                const result = await connection.query(query, (err, result) => {
                                    if (err) {
                                        connection.rollback(() => {
                                            logger.error(`[tutorialService][addPost] Insert to blog table fail: ${err}`, { filename: `${__filename}` })
                                            connection.release()
                                            reject(err.sqlMessage)
                                        })
                                    } else {
                                        logger.info('Insert  Product ok, wait for insert to iamge', { filename: `${__filename}` })
                                        const insertId = result.insertId;
                                        console.log(insertId)
                                        const query2 = `INSERT INTO product_image (product_id,url_image1,url_image2,url_image3,url_image4,url_image5,url_image6,url_image7,url_image8) 
                                            VALUES (${mysql.escape(insertId)},${mysql.escape(url_image1)},${mysql.escape(url_image2)},${mysql.escape(url_image3)},${mysql.escape(url_image4)},${mysql.escape(url_image5)},${mysql.escape(url_image6)},${mysql.escape(url_image7)},${mysql.escape(url_image8)})`
                                        connection.query(query2, (err1, result1) => {
                                            if (err1) {
                                                connection.rollback(() => {
                                                    logger.error(`[productService][addImage] Insert to blog table fail: ${err}`, { filename: `${__filename}` })
                                                    connection.release()
                                                    reject(err.sqlMessage)
                                                })
                                            }
                                            else {
                                                console.log(result);
                                                connection.release();
                                                resolve('success');
                                            }

                                        })

                                    }
                                }
                                )

                            }

                        }
                        )
                    }
                }

            )

        })
    }
    updateProduct(id, name, description, model_number, list_product_images, origin,
        brand, thickness, price, unit_cost, material, weight, feature, repeat_deg, size, category_id) {
        const url_image1 = list_product_images[0] ? list_product_images[0] : null;
        const url_image2 = list_product_images[1] ? list_product_images[1] : null;
        const url_image3 = list_product_images[2] ? list_product_images[2] : null;
        const url_image4 = list_product_images[3] ? list_product_images[3] : null;
        const url_image5 = list_product_images[4] ? list_product_images[4] : null;
        const url_image6 = list_product_images[5] ? list_product_images[5] : null;
        const url_image7 = list_product_images[6] ? list_product_images[6] : null;
        const url_image8 = list_product_images[7] ? list_product_images[7] : null;
        return new Promise(async (resolve, reject) => {
            const query0 = `SELECT COUNT(*) AS numProduct FROM product WHERE id = ${mysql.escape(id)}`
            let result0 = await this.mysqlDb.poolQuery(query0)
            if (!result0[0].numProduct) {
                return reject(`Product with id ${id} not found`)
            }

            this.mysqlDb.pool.getConnection(
                async (err, connection) => {
                    if (err) {
                        logger.error(`[tutorialService][addPost] Getting connection from pool failed \n ${err}`, { filename: `${__filename}` })
                        connection.release()
                        reject(err)
                    } else {
                        connection.beginTransaction(async err => {
                            if (err) {
                                console.log(err);
                                connection.release()
                            }
                            const query = `UPDATE product
                                SET name = ${mysql.escape(name)},
                                description = ${mysql.escape(description)},
                                model_number = ${mysql.escape(model_number)},
                                origin = ${mysql.escape(origin)},
                                brand = ${mysql.escape(brand)},
                                thickness = ${mysql.escape(thickness)},
                                price = ${mysql.escape(price)},
                                unit_cost = ${mysql.escape(unit_cost)},
                                material= ${mysql.escape(material)},
                                weight= ${mysql.escape(weight)},
                                feature= ${mysql.escape(feature)},
                                repeat_deg= ${mysql.escape(repeat_deg)},
                                size= ${mysql.escape(size)},
                                category_id = ${mysql.escape(category_id)}
                                WHERE id = ${mysql.escape(id)}
                                `
                            connection.query(query, (err, result) => {
                                if (err) {
                                    connection.rollback(() => {
                                        logger.error(`[productService][addImage] Insert to blog table fail: ${err}`)
                                        connection.release()
                                        reject(err.sqlMessage)
                                    })
                                }else {
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
                                    connection.query(query1, (err1, result) => {
                                        if (err1) {
                                            connection.rollback(() => {
                                                logger.error(`[productService][addImage] Insert to blog table fail: ${err}`, { filename: `${__filename}` })
                                                connection.release()
                                                reject(err.sqlMessage);
                                            })
                                        } else {
                                            connection.release()
                                            resolve('Update product success');
                                        }
                                    })
                                }
                            })
                        })
                    }
                })

        })
    }
    deleteProduct(id) {
        return new Promise(async (resolve, reject) => {
            let query =  `SELECT COUNT(*) AS numProduct FROM product WHERE id = ${mysql.escape(id)}`
                let result1 = await this.mysqlDb.poolQuery(query)
                if (!result1[0].numProduct) {
                    return reject(`Product with id ${id} not found`)
                }
                this.mysqlDb.pool.getConnection(
                    (err, connection) => {
                        if (err) {
                            reject(`Error connect database ${err}`);
                        }
                        connection.beginTransaction(async (err, result) => {
                            if(err){
                                reject('Conection vs DB fault');
                            }
                            const query = `
                            DELETE FROM product
                            WHERE id = ${mysql.escape(id)}
                            `
                            connection.query(query, (err1, result1) => {
                                if (err1) {
                                    connection.rollback(() => {
                                        connection.release()
                                        reject(err1)
                                    })
                                }
                                connection.release();
                                return resolve(`Delete product with id ${id} sucessfully`)

                            })


                        })


                    })
    })
    }
    getListBrands() {
        return new Promise(async (resolve, reject) => {
            const query = `
         SELECT brand FROM product GROUP BY brand;  
         `
            console.log(query)
            const [err, listBrands] = await to(this.mysqlDb.poolQuery(query));
            console.log(listBrands)
            if (err) {
                logger.error(`[productService][getMaterial] errors: `, err)
                return reject(err)
            }
            return resolve(listBrands)
        })
    }
    returnProduct = (e) => {
        return {
            "id": e.id,
            "name": e.name,
            "description": e.description,
            "model_number": e.model_number,
            "brand": e.brand,
            "origin": e.origin,
            "thickness": e.thickness,
            "price": e.price,
            "unit_cost": e.unit_cost,
            "material": e.material,
            "weight": e.weight,
            "feature": e.feature,
            "repeat_deg": e.repeat_deg,
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
    returnListProduct = (listProduct) => {
        const returnList = listProduct.map(e => {
            return {
                "id": e.id,
                "name": e.name,
                "description": e.description,
                "model_number": e.model_number,
                "brand": e.brand,
                "origin": e.origin,
                "thickness": e.thickness,
                "price": e.price,
                "unit_cost": e.unit_cost,
                "material": e.material,
                "weight": e.weight,
                "feature": e.feature,
                "repeat_deg": e.repeat_deg,
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
    returnLibProductImages = (listProduct) => {
        const returnList = listProduct.map(e => {
            return {
                "id": e.id,
                "name": e.name,
                "category_id": e.category_id,
                "main_category_id": e.main_category_id,
                "main_category_name": e.main_category_name,
                "main_category_slug": e.main_category_slug,
                "list_product_images": [e.url_image1, e.url_image2, e.url_image3, e.url_image4,
                e.url_image5, e.url_image6, e.url_image7, e.url_image8].filter(e1 => (e1 !== null && e1?.length > 0)),
                "create_at": e.create_at,
                "update_at": e.update_at
            }
        }
        )
        return returnList
    }
}
module.exports = ProductService;
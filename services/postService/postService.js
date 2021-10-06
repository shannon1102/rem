'use strict'
const mysql = require('mysql');
const logger = require('../../logger');
const { to } = require('../../helper/to');
const { createSlug } = require('../../utils/index');
class PostService {
    constructor(mysqlDb) {
        this.mysqlDb = mysqlDb
    }

    getPosts(postsPerPage, pageNumber, orderType) {
        return new Promise(async (resolve, reject) => {
            let offsetDb, orderByDb
            orderType = orderType ? orderType : 'newest'
            pageNumber = pageNumber ? pageNumber : 1
            if (!postsPerPage) {
                postsPerPage = 100
                offsetDb = 0
            } else {
                offsetDb = postsPerPage * (pageNumber - 1)
            }
            if (orderType === 'oldest') {
                orderByDb = 'ASC'
            } else {
                orderByDb = 'DESC'
            }

            const queryCounter = `SELECT COUNT(*) as total FROM post`;
            const totalPostResult = await this.mysqlDb.poolQuery(queryCounter);
            const total_post = totalPostResult[0].total;
            const query = `
                SELECT * FROM post
                ORDER BY create_at ${mysql.escape(orderByDb).split(`'`)[1]}
                LIMIT ${postsPerPage}
                OFFSET ${mysql.escape(offsetDb)}
            `
            console.log(query);
            let [err, postsResult] = await to(this.mysqlDb.poolQuery(query))
            if (err) {
                logger.error(`[postService][getPosts] errors: `, err)
                return reject(err?.sqlMessage ? err.sqlMessage : err)
            } else {
                return resolve({ total: total_post, postsResult })
            }

        })
    }
    getPostById(id) {
        return new Promise(async (resolve, reject) => {
            const query = `
                SELECT * FROM post WHERE id = ${mysql.escape(id)}
            `

            const [err, postResult] = await to(this.mysqlDb.poolQuery(query))
            if (err) {
                logger.error(`[postService][getPostById] errors: `, err)
                return reject(err?.sqlMessage ? err.sqlMessage : err)
            }
            if (!postResult.length) {
                return reject(`post with id ${id} not found`)
            }
            return resolve(postResult[0])
        })
    }
    getPostBySlug(slug) {
        return new Promise(async (resolve, reject) => {
            const query = `
                SELECT * FROM post WHERE slug = ${mysql.escape(slug)}
            `

            const [err, postResult] = await to(this.mysqlDb.poolQuery(query))
            if (err) {
                logger.error(`[postService][getPostById] errors: `, err)
                return reject(err?.sqlMessage ? err.sqlMessage : err)
            }
            if (!postResult.length) {
                return reject(`post with id ${id} not found`)
            }
            return resolve(postResult[0])
        })
    }
    getPostByTagSlug(tag_slug, postsPerPage, pageNumber, orderType) {
        return new Promise(async (resolve, reject) => {
            let offsetDb, orderByDb
            orderType = orderType ? orderType : 'newest'
            pageNumber = pageNumber ? pageNumber : 1
            if (!postsPerPage) {
                postsPerPage = 100
                offsetDb = 0
            } else {
                offsetDb = postsPerPage * (pageNumber - 1)
            }
            if (orderType === 'oldest') {
                orderByDb = 'ASC'
            } else {
                orderByDb = 'DESC'
            }
            const queryCounter = `SELECT COUNT(*) as total FROM post
            JOIN tag ON tag.id = post.tag_id
            WHERE tag.slug = ${mysql.escape(tag_slug)}`;
            const totalPostResult = await this.mysqlDb.poolQuery(queryCounter);
            const total_post = totalPostResult[0].total;
            const query = `
                SELECT * FROM post
                JOIN tag ON tag.id = post.tag_id
                WHERE tag.slug = ${mysql.escape(tag_slug)}
                ORDER BY post.create_at ${mysql.escape(orderByDb).split(`'`)[1]}
                LIMIT ${postsPerPage}
                OFFSET ${mysql.escape(offsetDb)}
            `
            const [err, postsResult] = await to(this.mysqlDb.poolQuery(query))
            if (err) {
                logger.error(`[postService][getPostByTagSlug] errors: `, err)
                return reject(err?.sqlMessage ? err.sqlMessage : err)
            }
            if (!postsResult.length) {
                return resolve({ total: total_post, postsResult })
            }
            return resolve({ total: total_post, postsResult })
        })
    }
    getPostByTagId(tag_id, postsPerPage, pageNumber, orderType) {
        return new Promise(async (resolve, reject) => {
            let offsetDb, orderByDb
            orderType = orderType ? orderType : 'newest'
            pageNumber = pageNumber ? pageNumber : 1
            if (!postsPerPage) {
                postsPerPage = 100
                offsetDb = 0
            } else {
                offsetDb = postsPerPage * (pageNumber - 1)
            }
            if (orderType === 'oldest') {
                orderByDb = 'ASC'
            } else {
                orderByDb = 'DESC'
            }
            const queryCounter = `SELECT COUNT(*) as total FROM post
            WHERE post.tag_id = ${mysql.escape(tag_id)}`;
            const totalPostResult = await this.mysqlDb.poolQuery(queryCounter);
            const total_post = totalPostResult[0].total;

            const query = `
                SELECT * FROM post WHERE tag_id = ${mysql.escape(tag_id)}
                ORDER BY create_at ${mysql.escape(orderByDb).split(`'`)[1]}
                LIMIT ${postsPerPage}
                OFFSET ${mysql.escape(offsetDb)}
            `

            const [err, postsResult] = await to(this.mysqlDb.poolQuery(query))
            if (err) {
                logger.error(`[postService][getPostByTagId] errors: `, err)
                return reject(err?.sqlMessage ? err.sqlMessage : err)
            }   
            if (!postsResult.length) {
                return resolve({total:total_post,postsResult})
            }
            return resolve({total:total_post,postsResult})
        })
    }
    getPostByTitle(title) {
        return new Promise(async (resolve, reject) => {
            const query = `
                SELECT * FROM post WHERE title = ${mysql.escape(title)}
            `

            const [err, postResult] = await to(this.mysqlDb.poolQuery(query))
            if (err) {
                logger.error(`[postService][getPostByTitle] errors: `, err)
                return reject(err?.sqlMessage ? err.sqlMessage : err)
            }
            return resolve(postResult)
        })
    }
    createPost(title, url_image, content, tag_id) {
        return new Promise(async (resolve, reject) => {
            const slug = createSlug(title);
            const query = `
                INSERT INTO post(title,url_image, content,tag_id,slug)
                VALUES(${mysql.escape(title)},${mysql.escape(url_image)},${mysql.escape(content)},${mysql.escape(tag_id)},${mysql.escape(slug)})
            `
            const [err, result] = await to(this.mysqlDb.poolQuery(query))
            if (err) {
                logger.error(`[postService][createPost] errors: `, err)
                return reject(err)
            }
            return resolve(result?.insertId)
        })
    }
    updatePost(id, title, url_image, content, tag_id) {
        return new Promise(async (resolve, reject) => {
            const query = `
                UPDATE post SET 
                title = ${mysql.escape(title)},
                content = ${mysql.escape(content)},
                url_image = ${mysql.escape(url_image)},
                tag_id = ${mysql.escape(tag_id)}
                WHERE id = ${mysql.escape(id)}
            `
            const [err, result] = await to(this.mysqlDb.poolQuery(query))
            if (err) {
                logger.error(`[postService][updatePost] errors: `, err)
                return reject(err)
            }
            if (result.affectedRows === 0) {
                return reject(`post with id ${id} not found`)
            }
            return resolve(result)
        })
    }
    deletePost(id) {
        return new Promise(async (resolve, reject) => {
            try {
                const query = `
                    DELETE FROM post
                    WHERE id = ${mysql.escape(id)}
                `
                let result = await this.mysqlDb.poolQuery(query)
                if (result.affectedRows === 0) {
                    return reject(`post with id ${id} not found`)
                }

                return resolve()
            } catch (err) {
                logger.error(`[postService][deletePost] errors: `, err)
                return reject(err?.sqlMessage ? err.sqlMessage : err)
            }
        })
    }

}


module.exports = PostService
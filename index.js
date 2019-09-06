"use strict";

const puppeteer = require('puppeteer');

/**
 * Create PDF using Puppeteer and return buffer.
 * @param {String} url URL to render.
 * @returns {Buffer}
 */
var createPdf = async (url, options) => {
    const browser = await puppeteer.launch({args: ['--no-sandbox']});
    const page = await browser.newPage();

    await page.goto(
        url,
        {
            waitUntil: 'networkidle2'
        });

    let buffer = await page.pdf(options);

    await browser.close();

    return buffer;
};

/**
 * Render PDF with Puppeteer and respond.
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.pdf = (req, res) => {
    let origin = req.headers['origin']
        ? req.headers['origin']
        : '*';

    res.set('Access-Control-Allow-Origin', origin);
    res.set('Access-Control-Max-Age', '3600');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    let url = null,
        options = {};

    if (req.method === 'GET') {
        if (req.query.url) {
            url = req.query.url;
        }

        if (req.query.options) {
            options = JSON.parse(req.query.options);
        }
    }
    else if (req.method === 'POST') {
        if (req.body.url) {
            url = req.body.url;
        }

        if (req.body.options) {
            options = req.body.options;
        }
    }

    if (!url) {
        res
            .status(400)
            .json({
                message: '"url" is require query param.'
            });

        return;
    }

    return createPdf(url, options)
        .then((buffer) => {
            res.set('Content-Type', 'application/pdf');
            res.set('Content-Length', buffer.length);
            res.end(buffer);
        })
        .catch((err) => {
            console.error(err);

            res
                .status(500)
                .json({
                    message: 'Something went horribly wrong..',
                    err
                });
        });
};
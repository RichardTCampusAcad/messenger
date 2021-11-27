const express = require('express')
const chatModel = require("../model/chat.model");
const userModel = require("../model/user.model");
const messageModel = require("../model/message.model");
const {param, validationResult} = require("express-validator");
const router = express.Router()

/**
 * Find chats by
 */
router.get('/', async (req, res) => {
    const chats = await chatModel.find()
    res.send(chats)
})

/**
 * Find the current chat
 */
router.get('/me', async (req, res) => {
    if (!req.chat) {
        return res.status(401).send({message: 'unauthorized'})
    }
    const chat = await chatModel.findOne({_id: req.chat._id})
    if (!chat) {
        return res.status(404).send({message: 'chat not found'})
    }
    res.send({chat: chat})
})

/**
 * Find by id
 */
router.get('/:id',
    param('id')
        .notEmpty()
        .withMessage('id is required')
        .isMongoId()
        .withMessage('id needs to be a mongodb id'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
        next()
    },
    async (req, res) => {
        const chat = await chatModel.findOne({_id: req.params.id})
        if (!chat) {
            res.status(404).send({message: 'chat not found'})
        }
        res.send({chat})
    })

/**
 * Create a chat
 */
router.post('/', async (req, res) => {
    try {
        let chat = new chatModel(req.body)
        chat = await chat.save()
        res.status(201).send({chat: chat})
    } catch (e) {
        res.status(400).send(e)
    }
})

/**
 * Add member
 */
router.post('/:id/add/:user',
    param('id')
        .notEmpty()
        .withMessage('id is required')
        .isMongoId()
        .withMessage('id needs to be a mongodb id'),
    param('user')
        .notEmpty()
        .withMessage('user is required')
        .isMongoId()
        .withMessage('user needs to be a mongodb id'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
        next()
    },
    async (req, res) => {
        let chat = await chatModel.findOne({_id: req.params.id})
        if (!chat) {
            res.status(404).send({message: 'chat not found'})
        }

        const user = await userModel.findOne({_id: req.params.user})
        if (!user) {
            res.status(404).send({message: 'user not found'})
        }

        if (!chat.members.includes(req.params.user)) {
            chat.members.push(user)
            chat = await chat.save()
            res.send({chat})
        }

        res.status(400).send({message: 'user already in chat'})
    })

/**
 * Add message
 */
router.post('/:id/message/add',
    param('id')
        .notEmpty()
        .withMessage('id is required')
        .isMongoId()
        .withMessage('id needs to be a mongodb id'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
        next()
    },
    async (req, res) => {
        let chat = await chatModel.findOne({_id: req.params.id})
        if (!chat) {
            res.status(404).send({message: 'chat not found'})
        }

        if (!req.body.text) {
            res.status(400).send({message: 'please provide a text'})
        }

        let message = new messageModel(req.body)
        message.chat = chat._id
        message.author = req.user._id
        message = await message.save()

        chat.messages.push(message)
        chat = await chat.save()
        res.status(200).send({chat: chat})
    })

/**
 * See all messages
 */
router.get('/:id/message',
    param('id')
        .notEmpty()
        .withMessage('id is required')
        .isMongoId()
        .withMessage('id needs to be a mongodb id'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
        next()
    },
    async (req, res) => {
        const chat = await chatModel.findOne({_id: req.params.id})
        if (!chat) {
            res.status(404).send({message: 'chat not found'})
        }

        let response = []
        let message
        for (let i=0; i < chat.messages.length; i++) {
            message = await messageModel.findOne({_id: chat.messages[i]})
            response.push(message)
        }

        res.status(200).send({message: message})
    })

module.exports = router
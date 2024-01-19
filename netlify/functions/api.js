import 'dotenv/config'
import express, { Router, application } from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import serverless from 'serverless-http'


const api = express()

api.use(cors())
api.use(bodyParser.json())



mongoose.connect(process.env.DATABASE_URL)

const userSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true
    },
    lastLogin: {
        type: Date,
        requird: true
    },
    userPicture: {
        type: String,
        required: true
    }
})

const commentSchema = new mongoose.Schema({
    title: String,
    text: String,
})

const User = mongoose.model('User', userSchema)
const Comment = mongoose.model('Comment', commentSchema)
const router = Router()

router.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Speeding Fine router'
    })
})
router.get('/login/form', (req, res) => {
    res.json({
        message: 'Welcome to form page'
    })
})

router.get('/comments', async(req, res) => {
    const allComments = await Comment.find({})
    res.json(allComments)
})
router.post('/comments/add',(req, res) => {
    const comment = req.body
    const newComment = new Comment({
        title: comment.title,
        text: comment.text,
    })
    newComment.save()
    .then(() => {
        console.log('Comment saved')
        res.sendStatus(200)
    })
    .catch(err => console.error(err))
})
router.delete('/comments/:id', (req, res) => {
    Comment.findByIdAndDelete(req.params.id)
    .then(() => {
        res.sendStatus(200)
    })
    .catch( err => {
        res.sendStatus(500)
    })
})

router.post('/user/login', async (req, res) => {
    const now = new Date()

    // create a new user if it doesnt exist
    if ( await User.countDocuments({"userEmail": req.body.userEmail}) === 0 ) {
        const newUser = new User({
            userEmail: req.body.userEmail,
            lastLogin: now
        })
        newUser.save()
        .then(() => {
            res.sendStatus(200)
        })
        .catch( err => {
            res.sendStatus(500)
        })
    } else {
        //existing user
        await User.findOneAndUpdate({"userEmail": req.body.userEmail}, {lastLogin: now})
        res.sendStatus(200)
    } 
})
api.use('/api/', router)
export const handler = serverless(api)

